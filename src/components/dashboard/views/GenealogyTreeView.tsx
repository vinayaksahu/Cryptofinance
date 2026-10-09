"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Users,
  Search,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  DollarSign,
  TrendingUp,
  UserCheck,
  UserX,
  Sparkles,
  Info,
  X,
  Copy,
  Check,
  ArrowLeft,
} from "lucide-react";
import { TreeNodeData } from "@/app/api/member/genealogy/route";

interface GenealogyTreeViewProps {
  user: any;
  onNavigateTab?: (tab: string) => void;
}

export function GenealogyTreeView({ user, onNavigateTab }: GenealogyTreeViewProps) {
  const [treeData, setTreeData] = useState<TreeNodeData | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [selectedNode, setSelectedNode] = useState<TreeNodeData | null>(null);
  const [rootFocusId, setRootFocusId] = useState<string | null>(null);
  const [focusHistory, setFocusHistory] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Fallback root node using actual logged-in user data if treeData hasn't loaded yet
  const fallbackRoot: TreeNodeData = {
    id: user?.id || "root",
    customId: user?.customId || "DF000001",
    name: user?.fullName ? `${user.fullName} (You)` : "You",
    username: user?.email ? `@${user.email.split("@")[0]}` : `@${user?.customId?.toLowerCase() || "member"}`,
    status: user?.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
    activeInvestment: Number(user?.fundBalance || 0),
    directTeamCount: 0,
    totalTeamCount: 0,
    level: 0,
    isYou: true,
    joinDate: user?.createdAt ? new Date(user.createdAt).toISOString().split("T")[0] : "-",
    doa: "-",
    children: [],
  };

  // Fetch real downline tree from backend API
  const fetchTree = async (rootId?: string) => {
    try {
      setLoading(true);
      const url = rootId ? `/api/member/genealogy?rootId=${rootId}` : `/api/member/genealogy`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load tree");
      const data = await res.json();

      if (data.root) {
        setTreeData(data.root);
        setStats(data.stats);
      }
    } catch (err) {
      console.error("[GenealogyTreeView] Failed to load downline tree:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTree(rootFocusId || undefined);
  }, [rootFocusId]);

  // Active data being viewed (always real data)
  const activeTree: TreeNodeData = treeData || fallbackRoot;

  // Toggle Collapse / Expand
  const toggleCollapse = (nodeId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCollapsedNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  // Expand / Collapse all
  const handleExpandAll = () => {
    setCollapsedNodes({});
  };

  const handleCollapseAll = () => {
    const coll: Record<string, boolean> = {};
    const traverse = (node: TreeNodeData) => {
      if (node.children && node.children.length > 0) {
        coll[node.id] = true;
        node.children.forEach(traverse);
      }
    };
    if (activeTree) traverse(activeTree);
    setCollapsedNodes(coll);
  };

  // Zoom handlers
  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 0.15, 1.6));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 0.15, 0.55));
  const handleResetZoom = () => setZoomLevel(1);

  // Focus on node (drill-down)
  const handleFocusNode = (node: TreeNodeData) => {
    if (node.id === activeTree.id) return;
    setFocusHistory((prev) => [...prev, activeTree.id]);
    setRootFocusId(node.id);
    setSelectedNode(null);
  };

  const handleBackToRoot = () => {
    setRootFocusId(null);
    setFocusHistory([]);
    setSelectedNode(null);
  };

  // Copy referral link
  const copyReferral = () => {
    const origin =
      typeof window !== "undefined" && window.location.hostname === "localhost"
        ? window.location.origin
        : "https://cryptonova.online";
    const refUrl = `${origin}/register?r=${user?.customId || "CF000001"}`;
    navigator.clipboard.writeText(refUrl);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Search filter helper
  const isNodeMatching = (node: TreeNodeData): boolean => {
    if (!searchTerm) return false;
    const term = searchTerm.toLowerCase();
    return (
      node.name.toLowerCase().includes(term) ||
      node.username.toLowerCase().includes(term) ||
      node.customId.toLowerCase().includes(term)
    );
  };

  // Recursive Tree Node Renderer
  const renderTreeNode = (node: TreeNodeData, isRoot = false) => {
    const isCollapsed = Boolean(collapsedNodes[node.id]);
    const hasChildren = node.children && node.children.length > 0;
    const isMatched = isNodeMatching(node);

    // Apply status filter to children if needed
    const visibleChildren = node.children.filter((child) => {
      if (statusFilter === "ALL") return true;
      return child.status === statusFilter;
    });

    return (
      <div key={node.id} className="flex flex-col items-center select-none">
        {/* The Node Card */}
        {isRoot ? (
          /* ROOT NODE (You) */
          <div
            onClick={() => setSelectedNode(node)}
            className={`cursor-pointer transition-all duration-200 relative group w-64 rounded-2xl p-4 sm:p-5 bg-card border-2 ${
              isMatched
                ? "border-primary ring-4 ring-primary/20 shadow-lg"
                : "border-primary/80 shadow-md"
            } hover:scale-[1.02]`}
          >
            {/* Header: Name + Badge */}
            <div className="flex items-center justify-between gap-2 mb-1">
              <h3 className="text-foreground font-bold text-sm sm:text-[15px] truncate">
                {node.name}
              </h3>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider shrink-0 ${
                  node.status === "ACTIVE"
                    ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                    : "bg-rose-500/15 text-rose-500 border border-rose-500/30"
                }`}
              >
                {node.status}
              </span>
            </div>

            {/* Username / Handle */}
            <p className="text-muted-foreground text-xs mb-3">
              {node.username}
            </p>

            {/* Separator */}
            <div className="border-t border-border my-2" />

            {/* Stats */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Active Investment:</span>
                <span className="text-emerald-500 font-bold">
                  ${node.activeInvestment.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Direct Team:</span>
                <span className="text-foreground font-semibold">
                  {node.directTeamCount} Members
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* CHILD NODE */
          <div
            onClick={() => setSelectedNode(node)}
            className={`cursor-pointer transition-all duration-200 relative group w-56 rounded-xl p-3.5 sm:p-4 bg-card border ${
              isMatched
                ? "border-primary ring-2 ring-primary/30 shadow-md"
                : "border-border hover:border-primary/60 shadow-sm"
            } hover:scale-[1.02]`}
          >
            {/* Header: Name + Badge */}
            <div className="flex items-center justify-between gap-2 mb-1">
              <h4 className="text-foreground font-bold text-xs sm:text-sm truncate">
                {node.name}
              </h4>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase shrink-0 ${
                  node.status === "ACTIVE"
                    ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                    : "bg-rose-500/15 text-rose-500 border border-rose-500/30"
                }`}
              >
                {node.status}
              </span>
            </div>

            {/* Username */}
            <p className="text-muted-foreground text-[11px] mb-2">
              {node.username}
            </p>

            {/* Separator */}
            <div className="border-t border-border my-2" />

            {/* Investment Row */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Investment:</span>
              <span className="font-bold text-emerald-500">
                ${node.activeInvestment.toFixed(2)}
              </span>
            </div>

            {/* Expand / Collapse Button (Only shown if member has children) */}
            {hasChildren && (
              <button
                type="button"
                onClick={(e) => toggleCollapse(node.id, e)}
                className="w-full mt-2.5 pt-2 border-t border-border flex items-center justify-center gap-1 text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                {isCollapsed ? (
                  <>
                    <span>▼ Expand ({node.children.length})</span>
                  </>
                ) : (
                  <>
                    <span>▲ Collapse ({node.children.length})</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Connector Line Below Node if it has children and is expanded */}
        {hasChildren && !isCollapsed && visibleChildren.length > 0 && (
          <>
            {/* Vertical trunk line going down from current node */}
            <div className="w-[1.5px] h-7 bg-primary/60" />

            {/* Children container with horizontal branch line */}
            <div className="relative flex justify-center">
              {/* Horizontal line across children */}
              {visibleChildren.length > 1 && (
                <div
                  className="absolute top-0 h-[1.5px] bg-primary/60"
                  style={{
                    left: `${100 / (visibleChildren.length * 2)}%`,
                    right: `${100 / (visibleChildren.length * 2)}%`,
                  }}
                />
              )}

              {/* Children Nodes Columns */}
              <div className="flex gap-5 sm:gap-7 items-start">
                {visibleChildren.map((child) => (
                  <div key={child.id} className="flex flex-col items-center">
                    {/* Vertical drop line down into child card */}
                    <div className="w-[1.5px] h-7 bg-primary/60" />
                    {renderTreeNode(child, false)}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* If Root Node has no downline yet, display referral invitation */}
        {isRoot && (!node.children || node.children.length === 0) && (
          <div className="mt-8 flex flex-col items-center text-center max-w-sm p-6 rounded-2xl bg-card border border-border shadow-md animate-in fade-in duration-300">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3">
              <Users className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-foreground mb-1">No Direct Team Members Yet</h4>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              Start building your 12-level network tree by inviting friends and partners using your personal referral link.
            </p>
            <button
              type="button"
              onClick={copyReferral}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold flex items-center gap-2 transition shadow-sm"
            >
              {copiedId ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Referral Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy My Referral Link</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-primary" />
            <span>Genealogy Tree</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Visual downline network & referral team hierarchy
          </p>
        </div>

        {/* Breadcrumb / Tab Switcher */}
        <div className="flex items-center gap-2 bg-muted/60 p-1.5 rounded-xl border border-border">
          <button
            type="button"
            onClick={() => onNavigateTab && onNavigateTab("downline-direct")}
            className="px-3 py-1 text-xs font-medium rounded-lg text-muted-foreground hover:text-foreground transition-colors"
          >
            Direct Team
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab && onNavigateTab("downline-team")}
            className="px-3 py-1 text-xs font-medium rounded-lg text-muted-foreground hover:text-foreground transition-colors"
          >
            Team List
          </button>
          <button
            type="button"
            className="px-3 py-1 text-xs font-bold rounded-lg bg-primary text-primary-foreground shadow-sm"
          >
            Tree View
          </button>
        </div>
      </div>

      {/* Network Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground font-medium">Total Network</span>
            <Users className="w-4 h-4 text-primary" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-foreground">
            {stats?.totalMembers ?? (activeTree.children.length > 0 ? activeTree.totalTeamCount + 1 : 1)}
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-emerald-500 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Active Members
            </span>
            <UserCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-500">
            {stats?.activeMembers ?? (activeTree.status === "ACTIVE" ? 1 : 0)}
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-rose-500 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Inactive Members
            </span>
            <UserX className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-rose-500">
            {stats?.inactiveMembers ?? (activeTree.status === "INACTIVE" ? 1 : 0)}
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-primary font-medium">Direct Team</span>
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-primary">
            {activeTree.directTeamCount}
          </p>
        </div>
      </div>

      {/* Main Interactive Tree Container */}
      <div className="bg-card border border-border rounded-3xl p-4 sm:p-6 shadow-sm relative overflow-hidden flex flex-col min-h-[580px]">
        {/* Top Controls Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-border shrink-0">
          {/* Left: Search & Filter */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative w-48 sm:w-60">
              <input
                type="text"
                placeholder="Search member (@name or ID)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-muted/50 border border-border rounded-xl pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
              <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-2.5" />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-2 text-muted-foreground hover:text-foreground text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div className="flex items-center bg-muted/50 border border-border rounded-xl p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setStatusFilter("ALL")}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  statusFilter === "ALL"
                    ? "bg-primary text-primary-foreground font-bold shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("ACTIVE")}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  statusFilter === "ACTIVE"
                    ? "bg-emerald-600 text-white font-bold shadow-sm"
                    : "text-muted-foreground hover:text-emerald-500"
                }`}
              >
                Active
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("INACTIVE")}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  statusFilter === "INACTIVE"
                    ? "bg-rose-600 text-white font-bold shadow-sm"
                    : "text-muted-foreground hover:text-rose-500"
                }`}
              >
                Inactive
              </button>
            </div>
          </div>

          {/* Right: Actions, Expand/Collapse, Zoom */}
          <div className="flex items-center gap-2">
            {/* Back to Root button when focused */}
            {rootFocusId && (
              <button
                type="button"
                onClick={handleBackToRoot}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/30 text-primary text-xs font-semibold hover:bg-primary/20 transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Reset to You</span>
              </button>
            )}

            {/* Expand / Collapse All */}
            <button
              type="button"
              onClick={handleExpandAll}
              title="Expand All Nodes"
              className="p-1.5 rounded-xl bg-muted/50 border border-border text-foreground hover:bg-muted text-xs font-medium flex items-center gap-1"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Expand All</span>
            </button>
            <button
              type="button"
              onClick={handleCollapseAll}
              title="Collapse All Nodes"
              className="p-1.5 rounded-xl bg-muted/50 border border-border text-foreground hover:bg-muted text-xs font-medium flex items-center gap-1"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Collapse All</span>
            </button>

            {/* Zoom Controls */}
            <div className="flex items-center bg-muted/50 border border-border rounded-xl p-0.5 text-xs">
              <button
                type="button"
                onClick={handleZoomOut}
                title="Zoom Out"
                className="p-1.5 rounded-lg text-foreground hover:bg-muted transition-colors"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 text-[11px] text-foreground font-semibold select-none">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                type="button"
                onClick={handleZoomIn}
                title="Zoom In"
                className="p-1.5 rounded-lg text-foreground hover:bg-muted transition-colors"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleResetZoom}
                title="Reset Zoom"
                className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Tree Canvas Area */}
        <div
          ref={containerRef}
          className="flex-1 w-full overflow-auto p-6 sm:p-8 flex justify-center items-start scrollbar-thin"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: "24px 24px",
            opacity: 0.95,
          }}
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center h-72 gap-3 text-muted-foreground">
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <p className="text-xs font-semibold uppercase tracking-wider">
                Loading Tree Hierarchy...
              </p>
            </div>
          ) : (
            <div
              className="transition-transform duration-200 origin-top flex justify-center py-2"
              style={{
                transform: `scale(${zoomLevel})`,
              }}
            >
              {renderTreeNode(activeTree, true)}
            </div>
          )}
        </div>

        {/* Bottom Legend & Quick Tip */}
        <div className="mt-4 pt-3 border-t border-border flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-emerald-400" />
              <span className="text-foreground font-medium">Active Member</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 border border-rose-400" />
              <span className="text-foreground font-medium">Inactive Member</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary border border-primary/80" />
              <span className="text-foreground font-medium">Root Node (You)</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Click on any member card to view detailed performance profile.</span>
          </div>
        </div>
      </div>

      {/* Member Detail Modal */}
      {selectedNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-foreground">
            {/* Close Button */}
            <button
              onClick={() => setSelectedNode(null)}
              className="absolute right-4 top-4 p-1.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Title */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-md font-bold text-lg">
                {selectedNode.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg text-foreground">
                    {selectedNode.name}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      selectedNode.status === "ACTIVE"
                        ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                        : "bg-rose-500/15 text-rose-500 border border-rose-500/30"
                    }`}
                  >
                    {selectedNode.status}
                  </span>
                </div>
                <p className="text-xs text-primary font-semibold">
                  {selectedNode.username} • ID: {selectedNode.customId}
                </p>
              </div>
            </div>

            {/* Detail Rows */}
            <div className="bg-muted/40 border border-border rounded-2xl p-4 space-y-2.5 text-xs mb-6">
              <div className="flex items-center justify-between py-1 border-b border-border">
                <span className="text-muted-foreground">Custom User ID</span>
                <span className="font-bold text-foreground">{selectedNode.customId}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-border">
                <span className="text-muted-foreground">Active Investment</span>
                <span className="font-bold text-emerald-500">
                  ${selectedNode.activeInvestment.toFixed(2)} USDT
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-border">
                <span className="text-muted-foreground">Direct Team</span>
                <span className="font-bold text-foreground">
                  {selectedNode.directTeamCount} Members
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-border">
                <span className="text-muted-foreground">Total Downline</span>
                <span className="font-bold text-foreground">
                  {selectedNode.totalTeamCount} Members
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-border">
                <span className="text-muted-foreground">Join Date</span>
                <span className="text-foreground">{selectedNode.joinDate || "-"}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-muted-foreground">Sponsor ID</span>
                <span className="text-foreground">{selectedNode.sponsorCustomId || "-"}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {!selectedNode.isYou && (
                <button
                  type="button"
                  onClick={() => handleFocusNode(selectedNode)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Focus Tree View</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedNode(null)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-muted border border-border text-foreground hover:bg-muted/80 text-xs font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
