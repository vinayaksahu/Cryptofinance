"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Trophy,
  Award,
  Crown,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Lock,
  CheckCircle2,
  ChevronRight,
  ArrowUpRight,
  Gift,
  Search,
  Zap,
  Flame,
  Users,
  Eye,
  Download,
  ChevronDown,
  Copy,
  Check,
  FileSpreadsheet,
  FileText,
  Printer,
} from "lucide-react";
import { TableExportToolbar } from "@/components/dashboard/TableExportToolbar";
import {
  copyTableToClipboard,
  exportToExcel,
  printOrExportPdf,
  ExportColumn,
} from "@/lib/exportUtils";

export interface MilestoneRank {
  id: number;
  title: string;
  icon: string;
  strong: number;
  weak: number;
  total: number;
  reward: string;
  cash: number;
  featured?: boolean;
}

export const MILESTONE_RANKS: MilestoneRank[] = [
  {
    id: 1,
    title: "Star Leader",
    icon: "⭐",
    strong: 500,
    weak: 500,
    total: 1000,
    reward: "Premium Smart Watch",
    cash: 25,
  },
  {
    id: 2,
    title: "Silver Leader",
    icon: "🥈",
    strong: 1250,
    weak: 1250,
    total: 2500,
    reward: "5G Android Smartphone",
    cash: 125,
  },
  {
    id: 3,
    title: "Gold Leader",
    icon: "🥇",
    strong: 2500,
    weak: 2500,
    total: 5000,
    reward: "Apple iPad / Business Laptop",
    cash: 250,
    featured: true,
  },
  {
    id: 4,
    title: "Ruby Director",
    icon: "💎",
    strong: 5000,
    weak: 5000,
    total: 10000,
    reward: "All-Expense Paid Dubai VIP Trip (3N/4D)",
    cash: 500,
    featured: true,
  },
  {
    id: 5,
    title: "Emerald Director",
    icon: "👑",
    strong: 12500,
    weak: 12500,
    total: 25000,
    reward: "Luxury Gold Watch / iPhone Pro Max",
    cash: 1250,
  },
  {
    id: 6,
    title: "Diamond Director",
    icon: "💠",
    strong: 25000,
    weak: 25000,
    total: 50000,
    reward: "International Luxury Holiday (Europe/Bali)",
    cash: 2500,
    featured: true,
  },
  {
    id: 7,
    title: "Blue Diamond",
    icon: "🏆",
    strong: 50000,
    weak: 50000,
    total: 100000,
    reward: "Sedan Car Fund / Royal Gold Bullion",
    cash: 5000,
  },
  {
    id: 8,
    title: "Crown King President",
    icon: "👑",
    strong: 125000,
    weak: 125000,
    total: 250000,
    reward: "Luxury Sports Car (BMW / Mercedes / Porsche)",
    cash: 12500,
    featured: true,
  },
];

interface MilestoneRewardsViewProps {
  user: any;
  onRefresh?: () => void;
}

export function MilestoneRewardsView({
  user,
  onRefresh,
}: MilestoneRewardsViewProps) {
  // Table & Toolbar States
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [appliedFrom, setAppliedFrom] = useState("");
  const [appliedTo, setAppliedTo] = useState("");
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isCopied, setIsCopied] = useState(false);
  const [selectedRankId, setSelectedRankId] = useState<number | null>(null);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const exportDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Node)) {
        setExportMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 1. Calculate Leg Volumes from direct referrals and team list
  const { branches, strongLeg, weakLeg, totalTurnover } = useMemo(() => {
    const directs = user?.directs || [];
    const teamList = user?.teamList || [];

    // Map each direct referral's branch volume
    const branchesList: { directId: string; directName: string; volume: number }[] =
      directs.map((d: any) => {
        let branchVolume = Number(d.amount || 0);

        const branchUserIds = new Set<string>([d.id, d.customId]);

        // Multi-pass to find downline members in this direct leg
        let added = true;
        let depth = 0;
        while (added && depth < 12) {
          added = false;
          depth++;
          for (const tm of teamList) {
            if (!branchUserIds.has(tm.id) && !branchUserIds.has(tm.customId)) {
              if (branchUserIds.has(tm.referralId)) {
                branchUserIds.add(tm.id);
                if (tm.customId) branchUserIds.add(tm.customId);
                branchVolume += Number(tm.amount || 0);
                added = true;
              }
            }
          }
        }

        return {
          directId: d.customId || d.id,
          directName: d.name || d.fullName || "Member",
          volume: branchVolume,
        };
      });

    // Sort descending: Leg 1 is Strong Leg, Legs 2..N are Weak Legs
    branchesList.sort((a, b) => b.volume - a.volume);

    let strong = branchesList.length > 0 ? branchesList[0].volume : 0;
    let weak = branchesList.slice(1).reduce((acc, b) => acc + b.volume, 0);

    // Fallback: If user has directBusiness recorded higher
    const recordedDirectBusiness = Number(user?.directBusiness || 0);
    if (strong + weak === 0 && recordedDirectBusiness > 0) {
      strong = recordedDirectBusiness * 0.5;
      weak = recordedDirectBusiness * 0.5;
    }

    return {
      branches: branchesList,
      strongLeg: strong,
      weakLeg: weak,
      totalTurnover: strong + weak,
    };
  }, [user]);

  // 2. Determine Current Rank, Next Rank & Progress
  const rankAnalysis = useMemo(() => {
    let currentRankIndex = -1;
    let totalUnlockedCash = 0;

    const ranksStatus = MILESTONE_RANKS.map((r, idx) => {
      const isQualifiedStrong = strongLeg >= r.strong;
      const isQualifiedWeak = weakLeg >= r.weak;
      const isAchieved = isQualifiedStrong && isQualifiedWeak;

      // Progress percentages
      const strongPct = Math.min(100, Math.round((strongLeg / r.strong) * 100));
      const weakPct = Math.min(100, Math.round((weakLeg / r.weak) * 100));
      const overallPct = Math.min(100, Math.round(((Math.min(strongLeg, r.strong) + Math.min(weakLeg, r.weak)) / r.total) * 100));

      if (isAchieved) {
        currentRankIndex = idx;
        totalUnlockedCash += r.cash;
      }

      return {
        ...r,
        isAchieved,
        isQualifiedStrong,
        isQualifiedWeak,
        strongPct,
        weakPct,
        overallPct,
        status: (isAchieved ? "ACHIEVED" : "LOCKED") as "ACHIEVED" | "IN PROGRESS" | "LOCKED",
      };
    });

    // Mark active in-progress target
    const nextRankIndex = currentRankIndex + 1 < MILESTONE_RANKS.length ? currentRankIndex + 1 : null;
    if (nextRankIndex !== null) {
      ranksStatus[nextRankIndex].status = "IN PROGRESS";
    }

    const currentRank = currentRankIndex >= 0 ? MILESTONE_RANKS[currentRankIndex] : null;
    const targetRank = nextRankIndex !== null ? ranksStatus[nextRankIndex] : null;

    return {
      ranksStatus,
      currentRank,
      targetRank,
      totalUnlockedCash,
    };
  }, [strongLeg, weakLeg]);

  // Filter ranks for the schedule table
  const filteredRanks = useMemo(() => {
    return rankAnalysis.ranksStatus.filter((r) => {
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchTitle = r.title.toLowerCase().includes(term);
        const matchReward = r.reward.toLowerCase().includes(term);
        const matchCash = String(r.cash).includes(term);
        if (!matchTitle && !matchReward && !matchCash) return false;
      }
      return true;
    });
  }, [rankAnalysis.ranksStatus, searchTerm]);

  // Pagination for table
  const totalPages = Math.max(1, Math.ceil(filteredRanks.length / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const pageItems = filteredRanks.slice(startIndex, startIndex + pageSize);

  // Export Columns definition
  const exportColumns: ExportColumn[] = [
    {
      header: "SR",
      key: "id",
      format: (row) => String(row.id),
    },
    {
      header: "RANK TITLE",
      key: "title",
      format: (row) => `${row.icon} ${row.title}`,
    },
    {
      header: "STRONG LEG (50%)",
      key: "strong",
      format: (row) => `$${row.strong.toLocaleString()} USDT`,
    },
    {
      header: "WEAK LEG (50%)",
      key: "weak",
      format: (row) => `$${row.weak.toLocaleString()} USDT`,
    },
    {
      header: "TOTAL VOLUME",
      key: "total",
      format: (row) => `$${row.total.toLocaleString()} USDT`,
    },
    {
      header: "GUARANTEED REWARD",
      key: "reward",
      format: (row) => row.reward,
    },
    {
      header: "CASH EQUIVALENT",
      key: "cash",
      format: (row) => `$${row.cash.toLocaleString()} USDT`,
    },
    {
      header: "STATUS",
      key: "status",
      format: (row) => row.status,
    },
  ];

  // Export Handlers
  const handleCopy = async () => {
    const success = await copyTableToClipboard(exportColumns, filteredRanks);
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleExcel = () => {
    exportToExcel("Milestone_Rewards_Matrix", exportColumns, filteredRanks);
  };

  const handlePdf = () => {
    printOrExportPdf(
      "Crypto Finance • Milestone Rewards Schedule",
      exportColumns,
      filteredRanks,
      `Total Unlocked Rewards: $${rankAnalysis.totalUnlockedCash.toLocaleString()} USDT`,
      user?.fullName || user?.customId
    );
  };

  const handlePrint = () => {
    printOrExportPdf(
      "Crypto Finance • Milestone Rewards Schedule",
      exportColumns,
      filteredRanks,
      `Total Unlocked Rewards: $${rankAnalysis.totalUnlockedCash.toLocaleString()} USDT`,
      user?.fullName || user?.customId
    );
  };

  const handleFilterSearch = () => {
    setAppliedFrom(fromDate);
    setAppliedTo(toDate);
    setCurrentPage(1);
  };

  const handleFilterReset = () => {
    setFromDate("");
    setToDate("");
    setAppliedFrom("");
    setAppliedTo("");
    setSearchTerm("");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-primary font-black text-xs tracking-wider uppercase bg-primary/10 border border-primary/30 px-3 py-1 rounded-full">
              INCOME STREAM #5 &bull; SLIDES 18 &amp; 19
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight font-display mt-2 flex items-center gap-2.5">
            <Trophy className="w-7 h-7 text-primary" />
            Milestone Rewards &amp; Leadership Ranks
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Turnover Milestones based on 50% Strong Leg &amp; 50% Weak Leg distribution. Permanent rank advancement with no volume expiration.
          </p>
        </div>

        <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 bg-muted/60 px-3.5 py-2 rounded-xl border border-border self-start sm:self-auto shrink-0">
          <span>🏠 Income</span>
          <span className="text-muted-foreground/60">/</span>
          <span className="text-primary font-semibold">Milestone Rewards</span>
        </div>
      </div>

      {/* 2. Top Metric KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Current Rank */}
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-sm relative overflow-hidden group hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Current Rank
            </span>
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
              <Crown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-xl sm:text-2xl font-black text-foreground flex items-center gap-2">
              <span>{rankAnalysis.currentRank ? rankAnalysis.currentRank.icon : "🌱"}</span>
              <span>{rankAnalysis.currentRank ? rankAnalysis.currentRank.title : "Starter Affiliate"}</span>
            </div>
            <p className="text-xs text-primary font-medium mt-1">
              {rankAnalysis.currentRank ? "Official Leadership Status" : "Begin qualification journey"}
            </p>
          </div>
        </div>

        {/* Card 2: Next Target Rank */}
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-sm relative overflow-hidden group hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Next Target Rank
            </span>
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-xl sm:text-2xl font-black text-foreground flex items-center gap-2">
              <span>{rankAnalysis.targetRank ? rankAnalysis.targetRank.icon : "👑"}</span>
              <span>{rankAnalysis.targetRank ? rankAnalysis.targetRank.title : "Crown King Achieved!"}</span>
            </div>
            <p className="text-xs text-muted-foreground font-medium mt-1">
              {rankAnalysis.targetRank ? `Bonus: $${rankAnalysis.targetRank.cash} USDT + ${rankAnalysis.targetRank.reward}` : "Highest Rank Reached"}
            </p>
          </div>
        </div>

        {/* Card 3: Strong Leg Business */}
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-sm relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Strong Leg (50%)
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-xl sm:text-2xl font-black text-emerald-500">
              ${strongLeg.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground font-medium mt-1">
              {rankAnalysis.targetRank ? `Target: $${rankAnalysis.targetRank.strong.toLocaleString()} USDT` : "Maximum achieved"}
            </p>
          </div>
        </div>

        {/* Card 4: Weak Leg Business */}
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-sm relative overflow-hidden group hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Other Legs (50%)
            </span>
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-xl sm:text-2xl font-black text-foreground">
              ${weakLeg.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground font-medium mt-1">
              {rankAnalysis.targetRank ? `Target: $${rankAnalysis.targetRank.weak.toLocaleString()} USDT` : "Maximum achieved"}
            </p>
          </div>
        </div>

        {/* Card 5: Total Rewards Unlocked */}
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-sm relative overflow-hidden group hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Rewards Unlocked
            </span>
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
              <Gift className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-xl sm:text-2xl font-black text-primary">
              ${rankAnalysis.totalUnlockedCash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground font-medium mt-1">
              {rankAnalysis.currentRank ? `Earned through ${rankAnalysis.currentRank.title}` : "Unlock on first rank"}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Next Rank Progress Tracking Card (Deep Interactive Visualizer) */}
      {rankAnalysis.targetRank && (
        <div className="bg-card border border-border rounded-3xl p-5 sm:p-7 shadow-sm relative overflow-hidden">
          <div className="relative z-10 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-2xl shadow-sm shrink-0">
                  {rankAnalysis.targetRank.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-black text-foreground">
                      Next Rank Target: {rankAnalysis.targetRank.title}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-primary/20 text-primary border border-primary/30 whitespace-nowrap shrink-0">
                      IN PROGRESS &bull; {rankAnalysis.targetRank.overallPct}%
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    Unlocks <span className="text-primary font-bold">${rankAnalysis.targetRank.cash} USDT Cash</span> + <span className="text-foreground font-semibold">{rankAnalysis.targetRank.reward}</span>
                  </p>
                </div>
              </div>

              {/* Requirement pill */}
              <div className="flex items-center gap-3 self-start md:self-auto bg-muted/60 border border-border px-4 py-2 rounded-2xl">
                <div className="text-right">
                  <div className="text-[10px] text-muted-foreground uppercase font-semibold">Requirement (50:50)</div>
                  <div className="text-xs sm:text-sm font-black text-foreground">
                    Total Volume: ${rankAnalysis.targetRank.total.toLocaleString()} USDT
                  </div>
                </div>
              </div>
            </div>

            {/* Dual Progress Bars: Strong Leg vs Weak Leg */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Strong Leg Progress */}
              <div className="bg-muted/30 border border-border rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-bold text-foreground">Strong Leg (50% Required)</span>
                  </div>
                  <span className={`font-extrabold ${rankAnalysis.targetRank.strongPct >= 100 ? "text-emerald-500" : "text-primary"}`}>
                    {rankAnalysis.targetRank.strongPct}% Completed
                  </span>
                </div>

                <div className="w-full bg-muted h-3 rounded-full overflow-hidden p-0.5 border border-border">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      rankAnalysis.targetRank.strongPct >= 100
                        ? "bg-emerald-500"
                        : "bg-primary"
                    }`}
                    style={{ width: `${Math.min(100, rankAnalysis.targetRank.strongPct)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Current: <strong className="text-foreground">${strongLeg.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT</strong></span>
                  <span>Target: <strong className="text-foreground">${rankAnalysis.targetRank.strong.toLocaleString()} USDT</strong></span>
                </div>

                <div className="text-[11px] pt-1 border-t border-border flex items-center justify-between">
                  <span className="text-muted-foreground">Leg Status:</span>
                  {strongLeg >= rankAnalysis.targetRank.strong ? (
                    <span className="text-emerald-500 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Target Achieved
                    </span>
                  ) : (
                    <span className="text-primary font-semibold">
                      Needs ${(rankAnalysis.targetRank.strong - strongLeg).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT more
                    </span>
                  )}
                </div>
              </div>

              {/* Weak Leg Progress */}
              <div className="bg-muted/30 border border-border rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="font-bold text-foreground">Other/Weaker Legs (50% Required)</span>
                  </div>
                  <span className={`font-extrabold ${rankAnalysis.targetRank.weakPct >= 100 ? "text-emerald-500" : "text-primary"}`}>
                    {rankAnalysis.targetRank.weakPct}% Completed
                  </span>
                </div>

                <div className="w-full bg-muted h-3 rounded-full overflow-hidden p-0.5 border border-border">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      rankAnalysis.targetRank.weakPct >= 100
                        ? "bg-emerald-500"
                        : "bg-primary"
                    }`}
                    style={{ width: `${Math.min(100, rankAnalysis.targetRank.weakPct)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Current: <strong className="text-foreground">${weakLeg.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT</strong></span>
                  <span>Target: <strong className="text-foreground">${rankAnalysis.targetRank.weak.toLocaleString()} USDT</strong></span>
                </div>

                <div className="text-[11px] pt-1 border-t border-border flex items-center justify-between">
                  <span className="text-muted-foreground">Leg Status:</span>
                  {weakLeg >= rankAnalysis.targetRank.weak ? (
                    <span className="text-emerald-500 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Target Achieved
                    </span>
                  ) : (
                    <span className="text-primary font-semibold">
                      Needs ${(rankAnalysis.targetRank.weak - weakLeg).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT more
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Direct Branches Breakdown Mini Table */}
            {branches.length > 0 && (
              <div className="bg-muted/20 rounded-2xl p-3.5 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-primary" />
                    Direct Team Legs Breakdown ({branches.length} Active Branches)
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Highest Leg = Strong Leg (50%), Remaining Legs = Weak Leg pool (50%)
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {branches.slice(0, 4).map((b, idx) => (
                    <div
                      key={b.directId}
                      className={`p-2.5 rounded-xl border text-xs ${
                        idx === 0
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                          : "bg-muted/50 border-border text-foreground"
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span className="truncate">{b.directName}</span>
                        <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                          {idx === 0 ? "Strong Leg" : `Leg #${idx + 1}`}
                        </span>
                      </div>
                      <div className="mt-1 text-sm font-black text-foreground">
                        ${b.volume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Eight Leadership Rank Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-6 bg-primary rounded-sm" />
            <h2 className="text-lg sm:text-xl font-bold text-foreground">
              Leadership Ranks &amp; Guaranteed Rewards Matrix
            </h2>
          </div>
          <span className="text-xs text-muted-foreground">8 Progressive Tiers</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {rankAnalysis.ranksStatus.map((rank) => {
            const isAchieved = rank.status === "ACHIEVED";
            const isInProgress = rank.status === "IN PROGRESS";

            return (
              <div
                key={rank.id}
                onClick={() => setSelectedRankId(selectedRankId === rank.id ? null : rank.id)}
                className={`rounded-3xl p-5 border transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  isAchieved
                    ? "bg-emerald-500/10 border-emerald-500/40 shadow-sm hover:border-emerald-500"
                    : isInProgress
                    ? "bg-primary/10 border-primary/50 shadow-sm ring-1 ring-primary/30 hover:border-primary"
                    : "bg-card border-border hover:border-primary/50 opacity-90 hover:opacity-100"
                }`}
              >
                {/* Header: Icon + Rank + Status Badge */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{rank.icon}</span>
                      <div>
                        <h3 className="font-bold text-foreground text-base leading-tight">
                          {rank.title}
                        </h3>
                        <span className="text-[10px] text-muted-foreground font-medium">
                          Tier #{rank.id}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase shrink-0 whitespace-nowrap ${
                        isAchieved
                          ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40"
                          : isInProgress
                          ? "bg-primary/20 text-primary border border-primary/40 animate-pulse"
                          : "bg-muted text-muted-foreground border border-border"
                      }`}
                    >
                      {rank.status}
                    </span>
                  </div>

                  {/* Guaranteed Physical Reward */}
                  <div className="mt-4 bg-muted/40 rounded-2xl p-3 border border-border space-y-1">
                    <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <Gift className="w-3 h-3 text-primary" />
                      Guaranteed Reward
                    </div>
                    <div className="text-xs font-bold text-foreground">
                      {rank.reward}
                    </div>
                  </div>

                  {/* Cash Bonus Highlight */}
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="text-xs text-muted-foreground">Cash Equivalent:</span>
                    <span className="text-lg font-black text-primary">
                      ${rank.cash.toLocaleString()} USDT
                    </span>
                  </div>

                  {/* Volume Targets */}
                  <div className="mt-3 pt-3 border-t border-border space-y-1 text-xs">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Strong Leg (50%):</span>
                      <strong className="text-foreground">${rank.strong.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Weak Leg (50%):</span>
                      <strong className="text-foreground">${rank.weak.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between text-muted-foreground font-bold pt-1 border-t border-border">
                      <span>Total Volume:</span>
                      <span className="text-foreground">${rank.total.toLocaleString()} USDT</span>
                    </div>
                  </div>
                </div>

                {/* Progress Mini Bar */}
                <div className="mt-4 pt-3 border-t border-border">
                  <div className="flex items-center justify-between text-[11px] mb-1.5">
                    <span className="text-muted-foreground">Progress</span>
                    <span className={`font-bold ${isAchieved ? "text-emerald-500" : isInProgress ? "text-primary" : "text-muted-foreground"}`}>
                      {rank.overallPct}%
                    </span>
                  </div>
                  <div className="w-full bg-muted h-2 rounded-full overflow-hidden border border-border">
                    <div
                      className={`h-full rounded-full ${
                        isAchieved
                          ? "bg-emerald-500"
                          : isInProgress
                          ? "bg-primary"
                          : "bg-muted-foreground/30"
                      }`}
                      style={{ width: `${Math.min(100, rank.overallPct)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Complete Milestone Rewards Schedule Table */}
      <div className="bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
        {/* Card Header with Title & Red Pill Total Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-6 bg-primary rounded-sm" />
            <h2 className="text-lg sm:text-xl font-bold text-foreground">
              Milestone Rewards Matrix &amp; Payout Schedule
            </h2>
          </div>

          {/* Primary / Red Total Badge */}
          <span className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground font-extrabold text-xs sm:text-sm tracking-wide shadow-sm transition-all self-start sm:self-auto">
            Total Unlocked : ${rankAnalysis.totalUnlockedCash.toLocaleString()} USDT
          </span>
        </div>

        {/* Toolbar: Search input + Date Pickers + Entries dropdown + Copy/Excel/PDF/Print */}
        <div className="space-y-4">
          <div className="bg-muted/40 border border-border rounded-2xl p-3.5 sm:p-4 flex flex-wrap items-center gap-3">
            {/* Quick Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search rank title, reward, or bonus..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-card border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
            </div>

            {/* Date Filters */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="pl-3 pr-2 py-2 rounded-xl bg-card border border-border text-xs text-foreground"
              />
              <span className="text-muted-foreground text-xs">to</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="pl-3 pr-2 py-2 rounded-xl bg-card border border-border text-xs text-foreground"
              />
            </div>

            <button
              type="button"
              onClick={handleFilterSearch}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-sm hover:bg-primary/90 transition-all"
            >
              Search
            </button>
            <button
              type="button"
              onClick={handleFilterReset}
              className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-bold text-xs border border-border transition-all"
            >
              Reset
            </button>
          </div>

          {/* Action Row: Entries Per Page + Export Buttons (Copy, Excel, PDF, Print) */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Show</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-card border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>entries</span>
            </div>

            {/* Export Dropdown Menu */}
            <div className="relative" ref={exportDropdownRef}>
              <button
                type="button"
                onClick={() => setExportMenuOpen(!exportMenuOpen)}
                className="px-3.5 py-1.5 rounded-xl bg-card border border-border text-foreground text-xs font-semibold hover:bg-muted transition-all flex items-center gap-2 shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-primary" />
                <span>Export</span>
                <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${exportMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {exportMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-36 rounded-xl bg-card border border-border shadow-xl py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                  {/* Copy option */}
                  <button
                    type="button"
                    onClick={() => {
                      handleCopy();
                      setExportMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-muted text-foreground flex items-center gap-2 transition-colors font-medium"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-500 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  {/* Excel option */}
                  <button
                    type="button"
                    onClick={() => {
                      handleExcel();
                      setExportMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-muted text-foreground flex items-center gap-2 transition-colors font-medium"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Excel</span>
                  </button>

                  {/* PDF option */}
                  <button
                    type="button"
                    onClick={() => {
                      handlePdf();
                      setExportMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-muted text-foreground flex items-center gap-2 transition-colors font-medium"
                  >
                    <FileText className="w-3.5 h-3.5 text-rose-500" />
                    <span>PDF</span>
                  </button>

                  <div className="my-1 border-t border-border" />

                  {/* Print option */}
                  <button
                    type="button"
                    onClick={() => {
                      handlePrint();
                      setExportMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-muted text-foreground flex items-center gap-2 transition-colors font-medium"
                  >
                    <Printer className="w-3.5 h-3.5 text-primary" />
                    <span>Print</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full text-left text-xs text-foreground">
            <thead className="bg-muted/50 text-muted-foreground font-bold uppercase text-[10px] tracking-wider border-b border-border">
              <tr>
                <th className="py-3 px-4 text-center">SR</th>
                <th className="py-3 px-4">RANK TITLE</th>
                <th className="py-3 px-4 text-right">STRONG LEG (50%)</th>
                <th className="py-3 px-4 text-right">WEAK LEG (50%)</th>
                <th className="py-3 px-4 text-right">TOTAL TURNOVER</th>
                <th className="py-3 px-4">GUARANTEED REWARD</th>
                <th className="py-3 px-4 text-right">CASH BONUS</th>
                <th className="py-3 px-4 text-center">PROGRESS</th>
                <th className="py-3 px-4 text-center whitespace-nowrap min-w-[130px]">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pageItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-muted-foreground">
                    No milestone ranks match your filter criteria.
                  </td>
                </tr>
              ) : (
                pageItems.map((rank, idx) => {
                  const isAchieved = rank.status === "ACHIEVED";
                  const isInProgress = rank.status === "IN PROGRESS";

                  return (
                    <tr
                      key={rank.id}
                      className={`hover:bg-muted/40 transition-colors ${
                        isAchieved
                          ? "bg-emerald-500/5"
                          : isInProgress
                          ? "bg-primary/5"
                          : ""
                      }`}
                    >
                      <td className="py-3.5 px-4 text-center font-semibold text-muted-foreground">
                        {startIndex + idx + 1}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2 font-bold text-foreground">
                          <span className="text-base">{rank.icon}</span>
                          <span>{rank.title}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-emerald-500">
                        ${rank.strong.toLocaleString()} USDT
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-foreground">
                        ${rank.weak.toLocaleString()} USDT
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-foreground">
                        ${rank.total.toLocaleString()} USDT
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-foreground">
                        {rank.reward}
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-primary">
                        ${rank.cash.toLocaleString()} USDT
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 bg-muted h-1.5 rounded-full overflow-hidden border border-border">
                            <div
                              className={`h-full rounded-full ${
                                isAchieved
                                  ? "bg-emerald-500"
                                  : isInProgress
                                  ? "bg-primary"
                                  : "bg-muted-foreground/30"
                              }`}
                              style={{ width: `${Math.min(100, rank.overallPct)}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-muted-foreground">
                            {rank.overallPct}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wide whitespace-nowrap ${
                            isAchieved
                              ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40"
                              : isInProgress
                              ? "bg-primary/20 text-primary border border-primary/40"
                              : "bg-muted text-muted-foreground border border-border"
                          }`}
                        >
                          {isInProgress && (
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shrink-0" />
                          )}
                          {isAchieved && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                          )}
                          {rank.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-muted-foreground pt-2 border-t border-border">
          <div>
            Showing {filteredRanks.length > 0 ? startIndex + 1 : 0} to{" "}
            {Math.min(startIndex + pageSize, filteredRanks.length)} of {filteredRanks.length} entries
          </div>

          <div className="flex items-center gap-1 self-start sm:self-auto">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              className="px-3 py-1.5 rounded-lg bg-card hover:bg-muted border border-border disabled:opacity-40 disabled:cursor-not-allowed font-medium text-foreground"
            >
              Previous
            </button>
            <div className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-bold">
              {currentPage}
            </div>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              className="px-3 py-1.5 rounded-lg bg-card hover:bg-muted border border-border disabled:opacity-40 disabled:cursor-not-allowed font-medium text-foreground"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
