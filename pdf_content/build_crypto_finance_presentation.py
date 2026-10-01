import os
import base64
import subprocess
import pymupdf

workspace = r"c:\Users\user\Desktop\CryptoFinance\pdf_content"

def get_base64_image(rel_path):
    full_path = os.path.join(workspace, rel_path)
    if os.path.exists(full_path):
        with open(full_path, "rb") as img_file:
            encoded = base64.b64encode(img_file.read()).decode('utf-8')
            mime = "image/jpeg" if full_path.endswith((".jpg", ".jpeg")) else "image/png"
            return f"data:{mime};base64,{encoded}"
    print(f"Warning: image {full_path} not found!")
    return ""

# Load assets
hero_b64 = get_base64_image("assets/hero_skyline.jpg")
office_b64 = get_base64_image("assets/office_building_crypto.jpg")
trading_b64 = get_base64_image("assets/crypto_trading.jpg")
rewards_b64 = get_base64_image("assets/luxury_rewards.jpg")
blockchain_b64 = get_base64_image("assets/usdt_blockchain.jpg")

# SVG Header Logo
header_logo_svg = """
<div class="logo-container">
    <svg width="44" height="44" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <polygon points="50,6 90,28 90,72 50,94 10,72 10,28" fill="#0B132B" stroke="#00FFA3" stroke-width="4"/>
        <polygon points="50,18 80,35 80,65 50,82 20,65 20,35" fill="none" stroke="rgba(0, 210, 255, 0.5)" stroke-width="2"/>
        <!-- C shape -->
        <path d="M46 36 C34 36 32 44 32 50 C32 56 34 64 46 64" fill="none" stroke="#00FFA3" stroke-width="5" stroke-linecap="round"/>
        <!-- F shape -->
        <path d="M54 36 L54 64 M54 36 L68 36 M54 49 L64 49" fill="none" stroke="#00D2FF" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
        <!-- Glowing nodes -->
        <circle cx="50" cy="18" r="4" fill="#00FFA3"/>
        <circle cx="80" cy="65" r="4" fill="#00D2FF"/>
        <circle cx="20" cy="65" r="4" fill="#00FFA3"/>
    </svg>
    <div style="display: flex; flex-direction: column;">
        <span class="logo-text">CRYPTO <span style="color: #00FFA3;">FINANCE</span></span>
        <span style="font-size: 11px; font-weight: 800; letter-spacing: 3px; color: #38BDF8; font-family: 'Space Grotesk', sans-serif;">QUANTITATIVE ALGO ECOSYSTEM</span>
    </div>
</div>
"""

# Hero Cover / Closing Large Logo
hero_logo_svg = """
<div style="display: flex; align-items: center; gap: 24px; margin-bottom: 24px;">
    <svg width="110" height="110" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <filter id="heroGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" result="blur"/>
                <feMerge>
                    <feMergeNode in="blur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
            <linearGradient id="heroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#00FFA3"/>
                <stop offset="100%" stop-color="#00D2FF"/>
            </linearGradient>
        </defs>
        <polygon points="50,6 90,28 90,72 50,94 10,72 10,28" fill="#070D1F" stroke="url(#heroGrad)" stroke-width="4.5" filter="url(#heroGlow)"/>
        <polygon points="50,18 80,35 80,65 50,82 20,65 20,35" fill="none" stroke="rgba(0, 210, 255, 0.6)" stroke-width="2.5"/>
        <!-- C shape -->
        <path d="M44 34 C30 34 28 44 28 50 C28 56 30 66 44 66" fill="none" stroke="#00FFA3" stroke-width="6" stroke-linecap="round"/>
        <!-- F shape -->
        <path d="M54 34 L54 66 M54 34 L70 34 M54 49 L66 49" fill="none" stroke="#00D2FF" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="50" cy="18" r="4.5" fill="#00FFA3"/>
        <circle cx="80" cy="65" r="4.5" fill="#00D2FF"/>
        <circle cx="20" cy="65" r="4.5" fill="#00FFA3"/>
    </svg>
    <div>
        <div style="background: rgba(0, 255, 163, 0.12); border: 2px solid #00FFA3; padding: 6px 24px; border-radius: 999px; display: inline-block; margin-bottom: 8px; box-shadow: 0 0 20px rgba(0, 255, 163, 0.2);">
            <span style="color: #00FFA3; font-size: 16px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;">Official Business Presentation • Pre-Launching Phase</span>
        </div>
        <h1 style="font-family: 'Space Grotesk', sans-serif; font-size: 88px; font-weight: 900; color: #FFFFFF; line-height: 1; letter-spacing: 2px;">
            CRYPTO <span style="background: linear-gradient(135deg, #00FFA3 0%, #00D2FF 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">FINANCE</span>
        </h1>
    </div>
</div>
"""

def generate_header(badge_text):
    return f"""
    <div class="slide-header">
        {header_logo_svg}
        <div class="header-badge">{badge_text}</div>
    </div>
    """

def generate_footer(topic, slide_num):
    return f"""
    <div class="slide-footer">
        <span class="footer-left">Crypto Finance • {topic}</span>
        <span class="footer-right">Slide {slide_num:02d} / 23</span>
    </div>
    """

html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Crypto Finance - Official Business Presentation</title>
<style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800;900&family=Space+Grotesk:wght@600;700;800;900&display=swap');

    @page {{
        size: 1920px 1080px;
        margin: 0;
    }}

    * {{
        box-sizing: border-box;
        margin: 0;
        padding: 0;
    }}

    body {{
        font-family: 'Plus Jakarta Sans', sans-serif;
        background-color: #040711;
        color: #FFFFFF;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    }}

    .slide {{
        width: 1920px;
        height: 1080px;
        page-break-after: always;
        page-break-inside: avoid;
        position: relative;
        overflow: hidden;
        background: radial-gradient(circle at 85% 15%, rgba(0, 210, 255, 0.08) 0%, rgba(4, 7, 17, 0.98) 60%),
                    radial-gradient(circle at 15% 85%, rgba(0, 255, 163, 0.07) 0%, rgba(4, 7, 17, 0.98) 60%),
                    linear-gradient(180deg, #070D1E 0%, #03060E 100%);
        padding: 48px 80px 38px 80px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }}

    /* Futuristic Circuit Grid Overlay */
    .slide::before {{
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image: 
            linear-gradient(rgba(0, 210, 255, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 210, 255, 0.02) 1px, transparent 1px);
        background-size: 48px 48px;
        pointer-events: none;
        z-index: 0;
    }}

    .slide-header, .slide-content, .slide-footer {{
        position: relative;
        z-index: 1;
    }}

    /* Header */
    .slide-header {{
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 2px solid rgba(0, 255, 163, 0.25);
        padding-bottom: 14px;
        margin-bottom: 18px;
        height: 68px;
    }}

    .logo-container {{
        display: flex;
        align-items: center;
        gap: 16px;
    }}

    .logo-text {{
        font-family: 'Space Grotesk', sans-serif;
        font-size: 26px;
        font-weight: 900;
        letter-spacing: 2px;
        color: #FFFFFF;
    }}

    .header-badge {{
        background: rgba(0, 210, 255, 0.12);
        border: 1.5px solid #00D2FF;
        color: #38BDF8;
        font-family: 'Space Grotesk', sans-serif;
        font-size: 15px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 1.5px;
        padding: 8px 24px;
        border-radius: 999px;
        box-shadow: 0 0 20px rgba(0, 210, 255, 0.2);
    }}

    /* Footer */
    .slide-footer {{
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-top: 2px solid rgba(0, 210, 255, 0.2);
        padding-top: 14px;
        margin-top: 16px;
        height: 44px;
    }}

    .footer-left {{
        font-size: 16px;
        font-weight: 700;
        color: #94A3B8;
        letter-spacing: 0.5px;
    }}

    .footer-right {{
        font-family: 'Space Grotesk', sans-serif;
        font-size: 15px;
        font-weight: 800;
        color: #00FFA3;
        background: rgba(0, 255, 163, 0.12);
        padding: 4px 18px;
        border-radius: 8px;
        border: 1.5px solid #00FFA3;
        box-shadow: 0 0 15px rgba(0, 255, 163, 0.15);
    }}

    /* Main Content Area */
    .slide-content {{
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
    }}

    /* Typography */
    .category-title {{
        color: #00FFA3;
        font-size: 18px;
        font-weight: 800;
        letter-spacing: 2.5px;
        text-transform: uppercase;
        margin-bottom: 6px;
        text-shadow: 0 0 15px rgba(0, 255, 163, 0.4);
    }}

    .main-title {{
        font-family: 'Space Grotesk', sans-serif;
        font-size: 46px;
        font-weight: 900;
        color: #FFFFFF;
        line-height: 1.15;
        margin-bottom: 6px;
    }}

    .subtitle {{
        font-size: 21px;
        color: #94A3B8;
        margin-bottom: 22px;
        line-height: 1.4;
        font-weight: 600;
    }}

    /* Cards */
    .card {{
        background: rgba(11, 18, 36, 0.75);
        border: 1.5px solid rgba(0, 210, 255, 0.25);
        border-radius: 20px;
        padding: 24px 26px;
        position: relative;
        backdrop-filter: blur(10px);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
    }}

    .card-emerald {{
        background: rgba(13, 25, 48, 0.85);
        border: 2px solid #00FFA3;
        box-shadow: 0 0 25px rgba(0, 255, 163, 0.2);
    }}

    .card-cyan {{
        background: rgba(13, 25, 48, 0.85);
        border: 2px solid #00D2FF;
        box-shadow: 0 0 25px rgba(0, 210, 255, 0.2);
    }}

    .card-vip {{
        background: rgba(16, 22, 46, 0.9);
        border: 2px solid #38BDF8;
        box-shadow: 0 0 30px rgba(56, 189, 248, 0.25);
    }}

    /* Grids */
    .grid-2 {{
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 28px;
    }}

    .grid-3 {{
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 24px;
    }}

    .grid-4 {{
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 22px;
    }}

    .grid-5 {{
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 18px;
    }}

    /* Custom Tables */
    .custom-table {{
        width: 100%;
        border-collapse: separate;
        border-spacing: 0;
        border-radius: 18px;
        overflow: hidden;
        border: 2px solid rgba(0, 255, 163, 0.35);
        background: #060B18;
    }}

    .custom-table th {{
        background: #0E172E;
        color: #00FFA3;
        padding: 16px 20px;
        font-size: 19px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 1px;
        border-bottom: 2px solid rgba(0, 255, 163, 0.35);
        text-align: left;
    }}

    .custom-table td {{
        background: rgba(11, 18, 36, 0.85);
        padding: 13px 20px;
        font-size: 19px;
        font-weight: 700;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        color: #FFFFFF;
    }}

    .custom-table tr:last-child td {{
        border-bottom: none;
    }}

    /* Buttons */
    .btn-emerald {{
        background: linear-gradient(135deg, #00FFA3 0%, #00D2FF 100%);
        color: #030712;
        font-size: 24px;
        font-weight: 900;
        padding: 18px 44px;
        border-radius: 16px;
        display: inline-block;
        box-shadow: 0 0 30px rgba(0, 255, 163, 0.35);
        letter-spacing: 1px;
    }}

    .btn-cyan {{
        background: linear-gradient(135deg, #00D2FF 0%, #3B82F6 100%);
        color: #FFFFFF;
        font-size: 22px;
        font-weight: 800;
        padding: 16px 36px;
        border-radius: 16px;
        display: inline-block;
        box-shadow: 0 0 25px rgba(0, 210, 255, 0.3);
    }}

    .visual-box {{
        border-radius: 22px;
        overflow: hidden;
        border: 2px solid rgba(0, 210, 255, 0.4);
        box-shadow: 0 0 35px rgba(0, 210, 255, 0.15);
        height: 520px;
        position: relative;
    }}

    .visual-box img {{
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }}
</style>
</head>
<body>

<!-- ==================== SLIDE 01: COVER ==================== -->
<div class="slide" style="justify-content: center; align-items: flex-start; background: linear-gradient(rgba(3, 7, 18, 0.82), rgba(3, 7, 18, 0.92)), url('{hero_b64}') center/cover no-repeat; padding-left: 100px; padding-right: 100px;">
    {hero_logo_svg}
    
    <p style="font-size: 28px; color: #FFFFFF; font-weight: 700; margin-bottom: 36px; max-width: 1500px; line-height: 1.4;">
        Decentralized Algorithmic Trading & High-Yield Wealth Ecosystem • Powered by <span style="color: #00FFA3; font-weight: 900;">USDT (BEP-20)</span>
    </p>

    <!-- Key Metrics Ribbon -->
    <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 20px; width: 100%; margin-bottom: 36px;">
        <div class="card card-emerald" style="padding: 22px 18px; text-align: center;">
            <div style="font-size: 34px; font-weight: 900; color: #00FFA3;">5% DAILY</div>
            <div style="font-size: 15px; color: #94A3B8; font-weight: 700; margin-top: 6px;">BASIC ROI (28 DAYS)</div>
        </div>
        <div class="card card-cyan" style="padding: 22px 18px; text-align: center;">
            <div style="font-size: 34px; font-weight: 900; color: #38BDF8;">10% & 15%</div>
            <div style="font-size: 15px; color: #94A3B8; font-weight: 700; margin-top: 6px;">FIX DEPOSIT (FD) ROI</div>
        </div>
        <div class="card card-emerald" style="padding: 22px 18px; text-align: center;">
            <div style="font-size: 34px; font-weight: 900; color: #00FFA3;">10% INSTANT</div>
            <div style="font-size: 15px; color: #94A3B8; font-weight: 700; margin-top: 6px;">DIRECT REFERRAL</div>
        </div>
        <div class="card card-cyan" style="padding: 22px 18px; text-align: center;">
            <div style="font-size: 34px; font-weight: 900; color: #38BDF8;">12 LEVELS</div>
            <div style="font-size: 15px; color: #94A3B8; font-weight: 700; margin-top: 6px;">DAILY TEAM ROYALTY</div>
        </div>
        <div class="card card-emerald" style="padding: 22px 18px; text-align: center;">
            <div style="font-size: 34px; font-weight: 900; color: #FBBF24;">REWARDS</div>
            <div style="font-size: 15px; color: #94A3B8; font-weight: 700; margin-top: 6px;">CARS, TRIPS & CASH</div>
        </div>
    </div>

    <div style="display: flex; align-items: center; gap: 36px;">
        <div class="btn-emerald" style="font-size: 24px; padding: 16px 44px;">JOIN WITH AS LOW AS $5 USDT</div>
        <div style="font-size: 22px; color: #94A3B8; font-weight: 700;">🌐 cryptofinance.online</div>
        <div style="font-size: 22px; color: #94A3B8; font-weight: 700;">📍 Crypto Valley Tower, Zug / Zurich, Switzerland</div>
    </div>
</div>

<!-- ==================== SLIDE 02: ABOUT COMPANY ==================== -->
<div class="slide">
    {generate_header("Corporate Profile")}
    <div class="slide-content">
        <div class="category-title">Institutional Financial Strength</div>
        <h2 class="main-title">About Crypto Finance</h2>
        <p class="subtitle">A premier global quantitative trading conglomerate with 15+ years of algorithmic mastery and 10+ years of crypto market leadership.</p>

        <div class="grid-2" style="align-items: center;">
            <div style="display: flex; flex-direction: column; gap: 20px;">
                <div class="card" style="display: flex; gap: 20px; align-items: flex-start; border-left: 4px solid #00FFA3;">
                    <div style="width: 64px; height: 64px; border-radius: 16px; background: rgba(0, 255, 163, 0.15); display: flex; align-items: center; justify-content: center; font-size: 32px; border: 1.5px solid #00FFA3; flex-shrink: 0;">⚡</div>
                    <div>
                        <h3 style="font-size: 26px; font-weight: 800; color: #00FFA3; margin-bottom: 6px;">15+ Years Proven Track Record</h3>
                        <p style="font-size: 19px; color: #94A3B8; line-height: 1.4;">Deep-rooted expertise in Quantitative Arbitrage, Algorithmic Market-Making, Institutional Forex, and High-Frequency Execution networks.</p>
                    </div>
                </div>

                <div class="card" style="display: flex; gap: 20px; align-items: flex-start; border-left: 4px solid #00D2FF;">
                    <div style="width: 64px; height: 64px; border-radius: 16px; background: rgba(0, 210, 255, 0.15); display: flex; align-items: center; justify-content: center; font-size: 32px; border: 1.5px solid #00D2FF; flex-shrink: 0;">📈</div>
                    <div>
                        <h3 style="font-size: 26px; font-weight: 800; color: #38BDF8; margin-bottom: 6px;">10+ Years Crypto Market Leadership</h3>
                        <p style="font-size: 19px; color: #94A3B8; line-height: 1.4;">Proprietary quantitative arbitrage, crypto derivatives trading, automated high-frequency bot liquidity, and risk-hedged futures strategies.</p>
                    </div>
                </div>

                <div class="card" style="display: flex; gap: 20px; align-items: flex-start; border-left: 4px solid #FBBF24;">
                    <div style="width: 64px; height: 64px; border-radius: 16px; background: rgba(251, 191, 36, 0.15); display: flex; align-items: center; justify-content: center; font-size: 32px; border: 1.5px solid #FBBF24; flex-shrink: 0;">💰</div>
                    <div>
                        <h3 style="font-size: 26px; font-weight: 800; color: #FBBF24; margin-bottom: 6px;">$25+ Million Generated</h3>
                        <p style="font-size: 19px; color: #94A3B8; line-height: 1.4;">Substantial multi-million dollar liquidity generation enabling guaranteed, sustainable daily returns to community members worldwide.</p>
                    </div>
                </div>
            </div>

            <div class="visual-box">
                <img src="{trading_b64}" alt="Trading Charts">
            </div>
        </div>
    </div>
    {generate_footer("Institutional Corporate Profile", 2)}
</div>

<!-- ==================== SLIDE 03: LEADERSHIP & HEADQUARTERS ==================== -->
<div class="slide">
    {generate_header("Executive Management")}
    <div class="slide-content">
        <div class="category-title">Visionary Leadership</div>
        <h2 class="main-title">Executive Leadership & Headquarters</h2>
        <p class="subtitle">Guided by quantitative visionary leadership and operating from the heart of the European crypto capital in Zug, Switzerland.</p>

        <div class="grid-2" style="align-items: center;">
            <div style="display: flex; flex-direction: column; gap: 22px;">
                <div class="card card-emerald" style="padding: 34px;">
                    <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 16px;">
                        <div style="width: 76px; height: 76px; border-radius: 18px; background: linear-gradient(135deg, #00FFA3, #00D2FF); display: flex; align-items: center; justify-content: center; font-size: 38px; flex-shrink: 0; color: #040711;">👨‍💼</div>
                        <div>
                            <div style="color: #94A3B8; font-size: 15px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;">Chairman & Managing Director</div>
                            <div style="color: #00FFA3; font-size: 36px; font-weight: 900; font-family: 'Space Grotesk', sans-serif;">Mr. Alex Rivera</div>
                        </div>
                    </div>
                    <p style="font-size: 20px; color: #94A3B8; line-height: 1.5;">
                        "Our mission is to democratize high-frequency institutional finance, ensuring every individual enjoys steady, transparent, and profitable daily returns powered by next-gen blockchain automation."
                    </p>
                </div>

                <div class="card" style="padding: 28px;">
                    <h4 style="font-size: 21px; font-weight: 800; color: #38BDF8; margin-bottom: 14px; text-transform: uppercase; letter-spacing: 1px;">Corporate Verification</h4>
                    <div style="display: flex; flex-direction: column; gap: 12px; font-size: 18px;">
                        <div style="display: flex; gap: 14px;"><span style="color: #00FFA3; font-size: 20px;">📍</span> <span><strong>Office Address:</strong> Crypto Valley Tower, Dammstrasse 19, 6300 Zug, Switzerland</span></div>
                        <div style="display: flex; gap: 14px;"><span style="color: #38BDF8; font-size: 20px;">🗓️</span> <span><strong>Official Launch Date:</strong> Pre-Launching Phase</span></div>
                        <div style="display: flex; gap: 14px;"><span style="color: #00FFA3; font-size: 20px;">✉️</span> <span><strong>Official Email:</strong> support@cryptofinance.online</span></div>
                        <div style="display: flex; gap: 14px;"><span style="color: #FBBF24; font-size: 20px;">🌐</span> <span><strong>Web Portal:</strong> cryptofinance.online</span></div>
                    </div>
                </div>
            </div>

            <div class="visual-box">
                <img src="{office_b64}" alt="Crypto Finance Headquarters">
                <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(3,7,18,0.95)); padding: 20px; text-align: center;">
                    <div style="color: #00FFA3; font-size: 22px; font-weight: 800;">CRYPTO FINANCE HEADQUARTERS</div>
                    <div style="color: #94A3B8; font-size: 16px; font-weight: 600;">Crypto Valley Tower, Dammstrasse 19, 6300 Zug, Switzerland</div>
                </div>
            </div>
        </div>
    </div>
    {generate_footer("Executive Leadership & Headquarters", 3)}
</div>

<!-- ==================== SLIDE 04: WHY CRYPTO FINANCE ==================== -->
<div class="slide">
    {generate_header("Core Advantages")}
    <div class="slide-content">
        <div class="category-title">The Crypto Finance Edge</div>
        <h2 class="main-title">Why Crypto Finance?</h2>
        <p class="subtitle">Built on trust, blockchain transparency, and industry-leading payout parameters designed for maximum investor wealth.</p>

        <div class="grid-4" style="margin-top: 10px;">
            <div class="card card-cyan" style="text-align: center; padding: 40px 22px;">
                <div style="width: 76px; height: 76px; margin: 0 auto 20px; border-radius: 20px; background: rgba(0, 210, 255, 0.15); display: flex; align-items: center; justify-content: center; font-size: 40px; border: 1.5px solid #00D2FF;">🌐</div>
                <h3 style="font-size: 25px; font-weight: 900; color: #38BDF8; margin-bottom: 12px;">100% USDT (BEP-20)</h3>
                <p style="font-size: 18px; color: #94A3B8; line-height: 1.4;">Zero currency volatility. Safe, fast, decentralized deposits and withdrawals on Binance Smart Chain.</p>
            </div>

            <div class="card card-emerald" style="text-align: center; padding: 40px 22px;">
                <div style="width: 76px; height: 76px; margin: 0 auto 20px; border-radius: 20px; background: rgba(0, 255, 163, 0.15); display: flex; align-items: center; justify-content: center; font-size: 40px; border: 1.5px solid #00FFA3;">🛡️</div>
                <h3 style="font-size: 25px; font-weight: 900; color: #00FFA3; margin-bottom: 12px;">100% Capital Transparency</h3>
                <p style="font-size: 18px; color: #94A3B8; line-height: 1.4;">Automated smart contract executions, live reserve liquidity, and real-time on-chain verifiable audit trails.</p>
            </div>

            <div class="card card-cyan" style="text-align: center; padding: 40px 22px;">
                <div style="width: 76px; height: 76px; margin: 0 auto 20px; border-radius: 20px; background: rgba(0, 210, 255, 0.15); display: flex; align-items: center; justify-content: center; font-size: 40px; border: 1.5px solid #00D2FF;">⚡</div>
                <h3 style="font-size: 25px; font-weight: 900; color: #38BDF8; margin-bottom: 12px;">Daily 5% ROI (28 Days)</h3>
                <p style="font-size: 18px; color: #94A3B8; line-height: 1.4;">Generates steady cash flow 7 days a week with disciplined 28-day fixed tenure contracts.</p>
            </div>

            <div class="card card-emerald" style="text-align: center; padding: 40px 22px;">
                <div style="width: 76px; height: 76px; margin: 0 auto 20px; border-radius: 20px; background: rgba(0, 255, 163, 0.15); display: flex; align-items: center; justify-content: center; font-size: 40px; border: 1.5px solid #00FFA3;">🔓</div>
                <h3 style="font-size: 25px; font-weight: 900; color: #00FFA3; margin-bottom: 12px;">No Compulsory Directs</h3>
                <p style="font-size: 18px; color: #94A3B8; line-height: 1.4;">Withdraw your daily basic ROI earnings freely every day. Zero forced direct referrals required to withdraw!</p>
            </div>
        </div>
    </div>
    {generate_footer("Key Competitive Strengths", 4)}
</div>

<!-- ==================== SLIDE 05: JOINING PACKAGES OVERVIEW ==================== -->
<div class="slide">
    {generate_header("Activation Tiers")}
    <div class="slide-content">
        <div class="category-title">Accessible to Everyone</div>
        <h2 class="main-title">Joining Packages: $5 To $5,000 USDT</h2>
        <p class="subtitle">Select the package that fits your financial goals. All packages run on a disciplined <strong>28-Day Tenure</strong> at <strong>5% Daily ROI</strong>.</p>

        <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px 12px; margin-top: 10px;">
            <div class="card" style="padding: 16px 8px; text-align: center; border: 1.5px solid rgba(0, 210, 255, 0.4);">
                <div style="font-size: 13px; color: #38BDF8; font-weight: 800; letter-spacing: 1.5px;">STARTER TIER</div>
                <div style="font-size: 38px; font-weight: 900; color: #FFFFFF; margin: 4px 0;">$5 <span style="font-size: 16px; color: #94A3B8;">USDT</span></div>
                <div style="font-size: 14px; color: #00FFA3; font-weight: 700;">Daily: $0.25 • 28D: $7.00</div>
            </div>

            <div class="card" style="padding: 16px 8px; text-align: center; border: 1.5px solid rgba(0, 210, 255, 0.4);">
                <div style="font-size: 13px; color: #38BDF8; font-weight: 800; letter-spacing: 1.5px;">STARTER TIER</div>
                <div style="font-size: 38px; font-weight: 900; color: #FFFFFF; margin: 4px 0;">$10 <span style="font-size: 16px; color: #94A3B8;">USDT</span></div>
                <div style="font-size: 14px; color: #00FFA3; font-weight: 700;">Daily: $0.50 • 28D: $14.00</div>
            </div>

            <div class="card" style="padding: 16px 8px; text-align: center; border: 1.5px solid rgba(0, 210, 255, 0.4);">
                <div style="font-size: 13px; color: #38BDF8; font-weight: 800; letter-spacing: 1.5px;">STARTER TIER</div>
                <div style="font-size: 38px; font-weight: 900; color: #FFFFFF; margin: 4px 0;">$20 <span style="font-size: 16px; color: #94A3B8;">USDT</span></div>
                <div style="font-size: 14px; color: #00FFA3; font-weight: 700;">Daily: $1.00 • 28D: $28.00</div>
            </div>

            <div class="card card-cyan" style="padding: 16px 8px; text-align: center;">
                <div style="font-size: 13px; color: #38BDF8; font-weight: 800; letter-spacing: 1.5px;">GROWTH PRO</div>
                <div style="font-size: 38px; font-weight: 900; color: #38BDF8; margin: 4px 0;">$50 <span style="font-size: 16px; color: #94A3B8;">USDT</span></div>
                <div style="font-size: 14px; color: #00FFA3; font-weight: 700;">Daily: $2.50 • 28D: $70.00</div>
            </div>

            <div class="card card-cyan" style="padding: 16px 8px; text-align: center;">
                <div style="font-size: 13px; color: #38BDF8; font-weight: 800; letter-spacing: 1.5px;">GROWTH TIER</div>
                <div style="font-size: 38px; font-weight: 900; color: #38BDF8; margin: 4px 0;">$100 <span style="font-size: 16px; color: #94A3B8;">USDT</span></div>
                <div style="font-size: 14px; color: #00FFA3; font-weight: 700;">Daily: $5.00 • 28D: $140.00</div>
            </div>

            <div class="card card-emerald" style="padding: 16px 8px; text-align: center;">
                <div style="font-size: 13px; color: #00FFA3; font-weight: 800; letter-spacing: 1.5px;">GROWTH RUBY</div>
                <div style="font-size: 38px; font-weight: 900; color: #00FFA3; margin: 4px 0;">$200 <span style="font-size: 16px; color: #94A3B8;">USDT</span></div>
                <div style="font-size: 14px; color: #38BDF8; font-weight: 700;">Daily: $10.00 • 28D: $280.00</div>
            </div>

            <div class="card card-emerald" style="padding: 16px 8px; text-align: center;">
                <div style="font-size: 13px; color: #00FFA3; font-weight: 800; letter-spacing: 1.5px;">GROWTH ELITE</div>
                <div style="font-size: 38px; font-weight: 900; color: #00FFA3; margin: 4px 0;">$500 <span style="font-size: 16px; color: #94A3B8;">USDT</span></div>
                <div style="font-size: 14px; color: #38BDF8; font-weight: 700;">Daily: $25.00 • 28D: $700.00</div>
            </div>

            <div class="card card-vip" style="padding: 16px 8px; text-align: center;">
                <div style="font-size: 13px; color: #38BDF8; font-weight: 800; letter-spacing: 1.5px;">ELITE VIP</div>
                <div style="font-size: 38px; font-weight: 900; color: #FFFFFF; margin: 4px 0;">$1,000 <span style="font-size: 16px; color: #00FFA3;">USDT</span></div>
                <div style="font-size: 14px; color: #00FFA3; font-weight: 800;">Daily: $50.00 • 28D: $1,400.00</div>
            </div>

            <div class="card card-vip" style="padding: 16px 8px; text-align: center;">
                <div style="font-size: 13px; color: #38BDF8; font-weight: 800; letter-spacing: 1.5px;">ELITE VIP</div>
                <div style="font-size: 38px; font-weight: 900; color: #FFFFFF; margin: 4px 0;">$2,000 <span style="font-size: 16px; color: #00FFA3;">USDT</span></div>
                <div style="font-size: 14px; color: #00FFA3; font-weight: 800;">Daily: $100.00 • 28D: $2,800.00</div>
            </div>

            <div class="card card-vip" style="padding: 16px 8px; text-align: center; border: 2px solid #00FFA3;">
                <div style="font-size: 13px; color: #00FFA3; font-weight: 800; letter-spacing: 1.5px;">ROYAL DIAMOND</div>
                <div style="font-size: 38px; font-weight: 900; color: #00FFA3; margin: 4px 0;">$5,000 <span style="font-size: 16px; color: #FFFFFF;">USDT</span></div>
                <div style="font-size: 14px; color: #38BDF8; font-weight: 900;">Daily: $250.00 • 28D: $7,000.00</div>
            </div>
        </div>
    </div>
    {generate_footer("Complete Joining Packages Suite ($5 - $5,000)", 5)}
</div>

<!-- ==================== SLIDE 06: STARTER PACKAGES ($5, $10, $20) ==================== -->
<div class="slide">
    {generate_header("Starter Tier")}
    <div class="slide-content">
        <div class="category-title">Accessible Micro-Investing</div>
        <h2 class="main-title">Starter Packages: $5 • $10 • $20 USDT</h2>
        <p class="subtitle">Ideal entry points for every beginner to experience automated daily earnings with zero barrier to entry.</p>

        <div class="grid-3" style="margin-top: 14px;">
            <!-- Card $5 -->
            <div class="card card-cyan" style="padding: 36px 30px; text-align: center;">
                <div style="background: rgba(0, 210, 255, 0.15); border: 1px solid #00D2FF; color: #38BDF8; display: inline-block; padding: 6px 20px; border-radius: 999px; font-size: 15px; font-weight: 800; letter-spacing: 1px; margin-bottom: 16px;">MICRO STARTER</div>
                <div style="font-size: 72px; font-weight: 900; color: #FFFFFF; font-family: 'Space Grotesk', sans-serif;">$5</div>
                <div style="font-size: 18px; color: #94A3B8; font-weight: 700; margin-bottom: 24px;">USDT BEP-20</div>

                <div style="background: rgba(3, 7, 18, 0.45); border-radius: 16px; padding: 20px; text-align: left; display: flex; flex-direction: column; gap: 12px; font-size: 19px;">
                    <div style="display: flex; justify-content: space-between;"><span>Daily Yield (5%):</span> <strong style="color: #00FFA3;">$0.25 USDT</strong></div>
                    <div style="display: flex; justify-content: space-between;"><span>Tenure Duration:</span> <strong>28 Days</strong></div>
                    <div style="display: flex; justify-content: space-between;"><span>Gross Return:</span> <strong style="color: #38BDF8;">$7.00 USDT</strong></div>
                    <div style="display: flex; justify-content: space-between;"><span>Net Profit:</span> <strong style="color: #00FFA3;">$2.00 USDT (40%)</strong></div>
                </div>
            </div>

            <!-- Card $10 -->
            <div class="card card-cyan" style="padding: 36px 30px; text-align: center;">
                <div style="background: rgba(0, 210, 255, 0.15); border: 1px solid #00D2FF; color: #38BDF8; display: inline-block; padding: 6px 20px; border-radius: 999px; font-size: 15px; font-weight: 800; letter-spacing: 1px; margin-bottom: 16px;">BASIC STARTER</div>
                <div style="font-size: 72px; font-weight: 900; color: #FFFFFF; font-family: 'Space Grotesk', sans-serif;">$10</div>
                <div style="font-size: 18px; color: #94A3B8; font-weight: 700; margin-bottom: 24px;">USDT BEP-20</div>

                <div style="background: rgba(3, 7, 18, 0.45); border-radius: 16px; padding: 20px; text-align: left; display: flex; flex-direction: column; gap: 12px; font-size: 19px;">
                    <div style="display: flex; justify-content: space-between;"><span>Daily Yield (5%):</span> <strong style="color: #00FFA3;">$0.50 USDT</strong></div>
                    <div style="display: flex; justify-content: space-between;"><span>Tenure Duration:</span> <strong>28 Days</strong></div>
                    <div style="display: flex; justify-content: space-between;"><span>Gross Return:</span> <strong style="color: #38BDF8;">$14.00 USDT</strong></div>
                    <div style="display: flex; justify-content: space-between;"><span>Net Profit:</span> <strong style="color: #00FFA3;">$4.00 USDT (40%)</strong></div>
                </div>
            </div>

            <!-- Card $20 -->
            <div class="card card-cyan" style="padding: 36px 30px; text-align: center;">
                <div style="background: rgba(0, 210, 255, 0.15); border: 1px solid #00D2FF; color: #38BDF8; display: inline-block; padding: 6px 20px; border-radius: 999px; font-size: 15px; font-weight: 800; letter-spacing: 1px; margin-bottom: 16px;">ADVANCED STARTER</div>
                <div style="font-size: 72px; font-weight: 900; color: #FFFFFF; font-family: 'Space Grotesk', sans-serif;">$20</div>
                <div style="font-size: 18px; color: #94A3B8; font-weight: 700; margin-bottom: 24px;">USDT BEP-20</div>

                <div style="background: rgba(3, 7, 18, 0.45); border-radius: 16px; padding: 20px; text-align: left; display: flex; flex-direction: column; gap: 12px; font-size: 19px;">
                    <div style="display: flex; justify-content: space-between;"><span>Daily Yield (5%):</span> <strong style="color: #00FFA3;">$1.00 USDT</strong></div>
                    <div style="display: flex; justify-content: space-between;"><span>Tenure Duration:</span> <strong>28 Days</strong></div>
                    <div style="display: flex; justify-content: space-between;"><span>Gross Return:</span> <strong style="color: #38BDF8;">$28.00 USDT</strong></div>
                    <div style="display: flex; justify-content: space-between;"><span>Net Profit:</span> <strong style="color: #00FFA3;">$8.00 USDT (40%)</strong></div>
                </div>
            </div>
        </div>
    </div>
    {generate_footer("Starter Packages ($5, $10, $20 USDT)", 6)}
</div>

<!-- ==================== SLIDE 07: GROWTH PACKAGES ($50, $100, $500) ==================== -->
<div class="slide">
    {generate_header("Growth Tier")}
    <div class="slide-content">
        <div class="category-title">Accelerated Wealth Creation</div>
        <h2 class="main-title">Growth Packages: $50 • $100 • $200 • $500 USDT</h2>
        <p class="subtitle">Most popular investment brackets chosen by community members for fast daily income generation.</p>

        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-top: 14px;">
            <!-- Card $50 -->
            <div class="card card-cyan" style="padding: 36px 20px; text-align: center;">
                <div style="background: rgba(0, 210, 255, 0.15); border: 1px solid #00D2FF; color: #38BDF8; display: inline-block; padding: 6px 16px; border-radius: 999px; font-size: 13px; font-weight: 800; letter-spacing: 1px; margin-bottom: 16px;">GROWTH PRO • QUALIFIER</div>
                <div style="font-size: 64px; font-weight: 900; color: #38BDF8; font-family: 'Space Grotesk', sans-serif;">$50</div>
                <div style="font-size: 16px; color: #94A3B8; font-weight: 700; margin-bottom: 20px;">USDT BEP-20</div>

                <div style="background: rgba(3, 7, 18, 0.45); border-radius: 16px; padding: 18px 14px; text-align: left; display: flex; flex-direction: column; gap: 10px; font-size: 16px;">
                    <div style="display: flex; justify-content: space-between;"><span>Daily Yield (5%):</span> <strong style="color: #00FFA3;">$2.50 USDT</strong></div>
                    <div style="display: flex; justify-content: space-between;"><span>Tenure Duration:</span> <strong>28 Days</strong></div>
                    <div style="display: flex; justify-content: space-between;"><span>Gross Return:</span> <strong style="color: #38BDF8;">$70.00 USDT</strong></div>
                    <div style="display: flex; justify-content: space-between;"><span>Net Profit:</span> <strong style="color: #00FFA3;">$20.00 USDT (40%)</strong></div>
                </div>
            </div>

            <!-- Card $100 -->
            <div class="card card-emerald" style="padding: 36px 20px; text-align: center; border: 2px solid #00FFA3;">
                <div style="background: linear-gradient(135deg, #00FFA3, #00D2FF); color: #040711; display: inline-block; padding: 6px 16px; border-radius: 999px; font-size: 13px; font-weight: 900; letter-spacing: 1px; margin-bottom: 16px;">MOST POPULAR</div>
                <div style="font-size: 64px; font-weight: 900; color: #FFFFFF; font-family: 'Space Grotesk', sans-serif;">$100</div>
                <div style="font-size: 16px; color: #00FFA3; font-weight: 700; margin-bottom: 20px;">USDT BEP-20</div>

                <div style="background: rgba(3, 7, 18, 0.45); border-radius: 16px; padding: 18px 14px; text-align: left; display: flex; flex-direction: column; gap: 10px; font-size: 16px;">
                    <div style="display: flex; justify-content: space-between;"><span>Daily Yield (5%):</span> <strong style="color: #00FFA3;">$5.00 USDT</strong></div>
                    <div style="display: flex; justify-content: space-between;"><span>Tenure Duration:</span> <strong>28 Days</strong></div>
                    <div style="display: flex; justify-content: space-between;"><span>Gross Return:</span> <strong style="color: #38BDF8;">$140.00 USDT</strong></div>
                    <div style="display: flex; justify-content: space-between;"><span>Net Profit:</span> <strong style="color: #00FFA3;">$40.00 USDT (40%)</strong></div>
                </div>
            </div>

            <!-- Card $200 -->
            <div class="card card-cyan" style="padding: 36px 20px; text-align: center;">
                <div style="background: rgba(0, 210, 255, 0.15); border: 1px solid #00D2FF; color: #38BDF8; display: inline-block; padding: 6px 16px; border-radius: 999px; font-size: 13px; font-weight: 800; letter-spacing: 1px; margin-bottom: 16px;">GROWTH RUBY</div>
                <div style="font-size: 64px; font-weight: 900; color: #38BDF8; font-family: 'Space Grotesk', sans-serif;">$200</div>
                <div style="font-size: 16px; color: #94A3B8; font-weight: 700; margin-bottom: 20px;">USDT BEP-20</div>

                <div style="background: rgba(3, 7, 18, 0.45); border-radius: 16px; padding: 18px 14px; text-align: left; display: flex; flex-direction: column; gap: 10px; font-size: 16px;">
                    <div style="display: flex; justify-content: space-between;"><span>Daily Yield (5%):</span> <strong style="color: #00FFA3;">$10.00 USDT</strong></div>
                    <div style="display: flex; justify-content: space-between;"><span>Tenure Duration:</span> <strong>28 Days</strong></div>
                    <div style="display: flex; justify-content: space-between;"><span>Gross Return:</span> <strong style="color: #38BDF8;">$280.00 USDT</strong></div>
                    <div style="display: flex; justify-content: space-between;"><span>Net Profit:</span> <strong style="color: #00FFA3;">$80.00 USDT (40%)</strong></div>
                </div>
            </div>

            <!-- Card $500 -->
            <div class="card card-emerald" style="padding: 36px 20px; text-align: center;">
                <div style="background: rgba(0, 255, 163, 0.15); border: 1px solid #00FFA3; color: #00FFA3; display: inline-block; padding: 6px 16px; border-radius: 999px; font-size: 13px; font-weight: 800; letter-spacing: 1px; margin-bottom: 16px;">GROWTH ELITE</div>
                <div style="font-size: 64px; font-weight: 900; color: #00FFA3; font-family: 'Space Grotesk', sans-serif;">$500</div>
                <div style="font-size: 16px; color: #94A3B8; font-weight: 700; margin-bottom: 20px;">USDT BEP-20</div>

                <div style="background: rgba(3, 7, 18, 0.45); border-radius: 16px; padding: 18px 14px; text-align: left; display: flex; flex-direction: column; gap: 10px; font-size: 16px;">
                    <div style="display: flex; justify-content: space-between;"><span>Daily Yield (5%):</span> <strong style="color: #00FFA3;">$25.00 USDT</strong></div>
                    <div style="display: flex; justify-content: space-between;"><span>Tenure Duration:</span> <strong>28 Days</strong></div>
                    <div style="display: flex; justify-content: space-between;"><span>Gross Return:</span> <strong style="color: #38BDF8;">$700.00 USDT</strong></div>
                    <div style="display: flex; justify-content: space-between;"><span>Net Profit:</span> <strong style="color: #00FFA3;">$200.00 USDT (40%)</strong></div>
                </div>
            </div>
        </div>
    </div>
    {generate_footer("Growth Packages ($50, $100, $200, $500 USDT)", 7)}
</div>

<!-- ==================== SLIDE 08: VIP PACKAGES ($1000, $2000, $5000) ==================== -->
<div class="slide">
    {generate_header("VIP Elite Club")}
    <div class="slide-content">
        <div class="category-title">Maximum Yield Powerhouse</div>
        <h2 class="main-title">VIP Packages: $1,000 • $2,000 • $5,000 USDT</h2>
        <p class="subtitle">Designed for high-net-worth leaders seeking premier institutional daily returns and maximum reward points.</p>

        <div class="grid-3" style="margin-top: 14px;">
            <!-- Card $1,000 -->
            <div class="card card-vip" style="padding: 36px 30px; text-align: center;">
                <div style="background: rgba(0, 210, 255, 0.15); border: 1px solid #00D2FF; color: #38BDF8; display: inline-block; padding: 6px 20px; border-radius: 999px; font-size: 15px; font-weight: 800; letter-spacing: 1px; margin-bottom: 16px;">VIP PLATINUM</div>
                <div style="font-size: 72px; font-weight: 900; color: #FFFFFF; font-family: 'Space Grotesk', sans-serif;">$1,000</div>
                <div style="font-size: 18px; color: #38BDF8; font-weight: 700; margin-bottom: 24px;">USDT BEP-20</div>

                <div style="background: rgba(3, 7, 18, 0.5); border-radius: 16px; padding: 20px; text-align: left; display: flex; flex-direction: column; gap: 12px; font-size: 19px;">
                    <div style="display: flex; justify-content: space-between;"><span>Daily Yield (5%):</span> <strong style="color: #00FFA3;">$50.00 USDT</strong></div>
                    <div style="display: flex; justify-content: space-between;"><span>Tenure Duration:</span> <strong>28 Days</strong></div>
                    <div style="display: flex; justify-content: space-between;"><span>Gross Return:</span> <strong style="color: #38BDF8;">$1,400.00 USDT</strong></div>
                    <div style="display: flex; justify-content: space-between;"><span>Net Profit:</span> <strong style="color: #00FFA3;">$400.00 USDT (40%)</strong></div>
                </div>
            </div>

            <!-- Card $2,000 -->
            <div class="card card-vip" style="padding: 36px 30px; text-align: center;">
                <div style="background: rgba(0, 255, 163, 0.15); border: 1px solid #00FFA3; color: #00FFA3; display: inline-block; padding: 6px 20px; border-radius: 999px; font-size: 15px; font-weight: 800; letter-spacing: 1px; margin-bottom: 16px;">VIP DIAMOND</div>
                <div style="font-size: 72px; font-weight: 900; color: #FFFFFF; font-family: 'Space Grotesk', sans-serif;">$2,000</div>
                <div style="font-size: 18px; color: #00FFA3; font-weight: 700; margin-bottom: 24px;">USDT BEP-20</div>

                <div style="background: rgba(3, 7, 18, 0.5); border-radius: 16px; padding: 20px; text-align: left; display: flex; flex-direction: column; gap: 12px; font-size: 19px;">
                    <div style="display: flex; justify-content: space-between;"><span>Daily Yield (5%):</span> <strong style="color: #00FFA3;">$100.00 USDT</strong></div>
                    <div style="display: flex; justify-content: space-between;"><span>Tenure Duration:</span> <strong>28 Days</strong></div>
                    <div style="display: flex; justify-content: space-between;"><span>Gross Return:</span> <strong style="color: #38BDF8;">$2,800.00 USDT</strong></div>
                    <div style="display: flex; justify-content: space-between;"><span>Net Profit:</span> <strong style="color: #00FFA3;">$800.00 USDT (40%)</strong></div>
                </div>
            </div>

            <!-- Card $5,000 -->
            <div class="card card-vip" style="padding: 36px 30px; text-align: center; border: 2px solid #00FFA3; box-shadow: 0 0 35px rgba(0, 255, 163, 0.3);">
                <div style="background: rgba(0, 255, 163, 0.2); border: 1px solid #00FFA3; color: #00FFA3; display: inline-block; padding: 6px 20px; border-radius: 999px; font-size: 15px; font-weight: 900; letter-spacing: 1px; margin-bottom: 16px;">ROYAL CROWN VIP</div>
                <div style="font-size: 72px; font-weight: 900; color: #00FFA3; font-family: 'Space Grotesk', sans-serif;">$5,000</div>
                <div style="font-size: 18px; color: #FFFFFF; font-weight: 700; margin-bottom: 24px;">USDT BEP-20</div>

                <div style="background: rgba(3, 7, 18, 0.5); border-radius: 16px; padding: 20px; text-align: left; display: flex; flex-direction: column; gap: 12px; font-size: 19px;">
                    <div style="display: flex; justify-content: space-between;"><span>Daily Yield (5%):</span> <strong style="color: #00FFA3;">$250.00 USDT</strong></div>
                    <div style="display: flex; justify-content: space-between;"><span>Tenure Duration:</span> <strong>28 Days</strong></div>
                    <div style="display: flex; justify-content: space-between;"><span>Gross Return:</span> <strong style="color: #38BDF8;">$7,000.00 USDT</strong></div>
                    <div style="display: flex; justify-content: space-between;"><span>Net Profit:</span> <strong style="color: #00FFA3;">$2,000.00 USDT (40%)</strong></div>
                </div>
            </div>
        </div>
    </div>
    {generate_footer("VIP Elite Packages ($1,000, $2,000, $5,000 USDT)", 8)}
</div>

<!-- ==================== SLIDE 09: COMPLETE PACKAGE MATRIX TABLE ==================== -->
<div class="slide">
    {generate_header("Financial Returns Matrix")}
    <div class="slide-content">
        <div class="category-title">Comprehensive 28-Day Projections</div>
        <h2 class="main-title">Basic ROI Packages & Return Matrix</h2>
        <p class="subtitle">Complete transparent calculation of daily returns and total gross payout over the 28-day contractual tenure.</p>

        <table class="custom-table" style="margin-top: 8px;">
            <thead>
                <tr>
                    <th>Package (USDT)</th>
                    <th>Daily ROI (5%)</th>
                    <th>7 Days Return</th>
                    <th>14 Days Return</th>
                    <th>28 Days (140% Return)</th>
                    <th>Net Profit (40%)</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong style="color: #FFFFFF;">$5 USDT</strong></td>
                    <td><strong style="color: #00FFA3;">$0.25</strong></td>
                    <td>$1.75</td>
                    <td>$3.50</td>
                    <td><strong style="color: #38BDF8;">$7.00 USDT</strong></td>
                    <td><strong style="color: #00FFA3;">+$2.00 USDT</strong></td>
                </tr>
                <tr>
                    <td><strong style="color: #FFFFFF;">$10 USDT</strong></td>
                    <td><strong style="color: #00FFA3;">$0.50</strong></td>
                    <td>$3.50</td>
                    <td>$7.00</td>
                    <td><strong style="color: #38BDF8;">$14.00 USDT</strong></td>
                    <td><strong style="color: #00FFA3;">+$4.00 USDT</strong></td>
                </tr>
                <tr>
                    <td><strong style="color: #FFFFFF;">$20 USDT</strong></td>
                    <td><strong style="color: #00FFA3;">$1.00</strong></td>
                    <td>$7.00</td>
                    <td>$14.00</td>
                    <td><strong style="color: #38BDF8;">$28.00 USDT</strong></td>
                    <td><strong style="color: #00FFA3;">+$8.00 USDT</strong></td>
                </tr>
                <tr>
                    <td><strong style="color: #FFFFFF;">$50 USDT</strong></td>
                    <td><strong style="color: #00FFA3;">$2.50</strong></td>
                    <td>$17.50</td>
                    <td>$35.00</td>
                    <td><strong style="color: #38BDF8;">$70.00 USDT</strong></td>
                    <td><strong style="color: #00FFA3;">+$20.00 USDT</strong></td>
                </tr>
                <tr>
                    <td><strong style="color: #38BDF8;">$100 USDT</strong></td>
                    <td><strong style="color: #00FFA3;">$5.00</strong></td>
                    <td>$35.00</td>
                    <td>$70.00</td>
                    <td><strong style="color: #38BDF8;">$140.00 USDT</strong></td>
                    <td><strong style="color: #00FFA3;">+$40.00 USDT</strong></td>
                </tr>
                <tr>
                    <td><strong style="color: #38BDF8;">$200 USDT</strong></td>
                    <td><strong style="color: #00FFA3;">$10.00</strong></td>
                    <td>$70.00</td>
                    <td>$140.00</td>
                    <td><strong style="color: #38BDF8;">$280.00 USDT</strong></td>
                    <td><strong style="color: #00FFA3;">+$80.00 USDT</strong></td>
                </tr>
                <tr>
                    <td><strong style="color: #38BDF8;">$500 USDT</strong></td>
                    <td><strong style="color: #00FFA3;">$25.00</strong></td>
                    <td>$175.00</td>
                    <td>$350.00</td>
                    <td><strong style="color: #38BDF8;">$700.00 USDT</strong></td>
                    <td><strong style="color: #00FFA3;">+$200.00 USDT</strong></td>
                </tr>
                <tr>
                    <td><strong style="color: #00FFA3;">$1,000 USDT</strong></td>
                    <td><strong style="color: #00FFA3;">$50.00</strong></td>
                    <td>$350.00</td>
                    <td>$700.00</td>
                    <td><strong style="color: #38BDF8;">$1,400.00 USDT</strong></td>
                    <td><strong style="color: #00FFA3;">+$400.00 USDT</strong></td>
                </tr>
                <tr>
                    <td><strong style="color: #00FFA3;">$2,000 USDT</strong></td>
                    <td><strong style="color: #00FFA3;">$100.00</strong></td>
                    <td>$700.00</td>
                    <td>$1,400.00</td>
                    <td><strong style="color: #38BDF8;">$2,800.00 USDT</strong></td>
                    <td><strong style="color: #00FFA3;">+$800.00 USDT</strong></td>
                </tr>
                <tr style="background: rgba(0, 255, 163, 0.12);">
                    <td><strong style="color: #00FFA3;">$5,000 USDT</strong></td>
                    <td><strong style="color: #00FFA3;">$250.00</strong></td>
                    <td>$1,750.00</td>
                    <td>$3,500.00</td>
                    <td><strong style="color: #38BDF8;">$7,000.00 USDT</strong></td>
                    <td><strong style="color: #00FFA3;">+$2,000.00 USDT</strong></td>
                </tr>
            </tbody>
        </table>
    </div>
    {generate_footer("Complete 28-Day Financial Projections Matrix", 9)}
</div>

<!-- ==================== SLIDE 10: 5 TYPES OF INCOME ==================== -->
<div class="slide">
    {generate_header("Compensation Plan")}
    <div class="slide-content">
        <div class="category-title">Multiple Revenue Streams</div>
        <h2 class="main-title">5 Powerful Types of Income</h2>
        <p class="subtitle">Experience an unprecedented combination of high-yield passive returns, team networking royalties, and milestone rewards.</p>

        <div class="grid-5" style="margin-top: 14px;">
            <div class="card card-emerald" style="text-align: center; padding: 36px 18px;">
                <div style="font-size: 46px; margin-bottom: 16px;">📈</div>
                <div style="font-size: 15px; color: #00FFA3; font-weight: 800; letter-spacing: 1px;">INCOME 01</div>
                <h3 style="font-size: 24px; font-weight: 900; color: #FFFFFF; margin: 10px 0;">Basic Daily ROI</h3>
                <div style="font-size: 32px; font-weight: 900; color: #00FFA3; margin-bottom: 8px;">5% Daily</div>
                <p style="font-size: 16px; color: #94A3B8; line-height: 1.4;">Earn 5% daily for 28 Days (140% gross). Credited 7 days a week.</p>
            </div>

            <div class="card card-cyan" style="text-align: center; padding: 36px 18px;">
                <div style="font-size: 46px; margin-bottom: 16px;">🏦</div>
                <div style="font-size: 15px; color: #38BDF8; font-weight: 800; letter-spacing: 1px;">INCOME 02</div>
                <h3 style="font-size: 24px; font-weight: 900; color: #FFFFFF; margin: 10px 0;">Fix Deposit (FD)</h3>
                <div style="font-size: 32px; font-weight: 900; color: #38BDF8; margin-bottom: 8px;">10% & 15%</div>
                <p style="font-size: 16px; color: #94A3B8; line-height: 1.4;">High-yield locked staking contracts delivering massive compounding yields.</p>
            </div>

            <div class="card card-emerald" style="text-align: center; padding: 36px 18px;">
                <div style="font-size: 46px; margin-bottom: 16px;">⚡</div>
                <div style="font-size: 15px; color: #00FFA3; font-weight: 800; letter-spacing: 1px;">INCOME 03</div>
                <h3 style="font-size: 24px; font-weight: 900; color: #FFFFFF; margin: 10px 0;">Direct Referral</h3>
                <div style="font-size: 32px; font-weight: 900; color: #00FFA3; margin-bottom: 8px;">10% Instant</div>
                <p style="font-size: 16px; color: #94A3B8; line-height: 1.4;">Instant 10% cash bonus credited directly in USDT for every sponsor.</p>
            </div>

            <div class="card card-cyan" style="text-align: center; padding: 36px 18px;">
                <div style="font-size: 46px; margin-bottom: 16px;">👥</div>
                <div style="font-size: 15px; color: #38BDF8; font-weight: 800; letter-spacing: 1px;">INCOME 04</div>
                <h3 style="font-size: 24px; font-weight: 900; color: #FFFFFF; margin: 10px 0;">Daily 12 Level</h3>
                <div style="font-size: 32px; font-weight: 900; color: #38BDF8; margin-bottom: 8px;">12 Levels</div>
                <p style="font-size: 16px; color: #94A3B8; line-height: 1.4;">Daily recurring team royalty up to 12 generations deep every single day.</p>
            </div>

            <div class="card card-emerald" style="text-align: center; padding: 36px 18px;">
                <div style="font-size: 46px; margin-bottom: 16px;">🏆</div>
                <div style="font-size: 15px; color: #FBBF24; font-weight: 800; letter-spacing: 1px;">INCOME 05</div>
                <h3 style="font-size: 24px; font-weight: 900; color: #FFFFFF; margin: 10px 0;">Reward Income</h3>
                <div style="font-size: 32px; font-weight: 900; color: #FBBF24; margin-bottom: 8px;">Mega Ranks</div>
                <p style="font-size: 16px; color: #94A3B8; line-height: 1.4;">Luxury tech, Swiss tours, and supercars on team turnover targets.</p>
            </div>
        </div>
    </div>
    {generate_footer("5 Pillars of Wealth Generation", 10)}
</div>

<!-- ==================== SLIDE 11: INCOME 1 - BASIC ROI (5%) ==================== -->
<div class="slide">
    {generate_header("Income Stream #1")}
    <div class="slide-content">
        <div class="category-title">Daily Passive Growth</div>
        <h2 class="main-title">Basic ROI Income: 5% Daily for 28 Days</h2>
        <p class="subtitle">Experience uninterrupted daily compounding yield credited directly into your wallet 7 days a week.</p>

        <div class="grid-2" style="align-items: center; margin-top: 10px;">
            <div style="display: flex; flex-direction: column; gap: 22px;">
                <div class="card card-emerald" style="padding: 34px;">
                    <div style="font-size: 60px; font-weight: 900; color: #00FFA3; line-height: 1; margin-bottom: 10px;">5% EVERY DAY</div>
                    <div style="font-size: 24px; color: #FFFFFF; font-weight: 800; margin-bottom: 12px;">Monday Through Sunday (No Non-Trading Days!)</div>
                    <p style="font-size: 19px; color: #94A3B8; line-height: 1.5;">
                        Your capital is deployed into live institutional crypto arbitrage and quantitative scalping bots, delivering pure 5% daily cash flow without market risk exposure.
                    </p>
                </div>

                <div class="card" style="padding: 32px;">
                    <h4 style="font-size: 22px; font-weight: 800; color: #38BDF8; margin-bottom: 16px; text-transform: uppercase;">Key Tenure Parameters</h4>
                    <div style="display: flex; flex-direction: column; gap: 12px; font-size: 20px;">
                        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 8px;">
                            <span>Contract Tenure:</span> <strong style="color: #00FFA3;">28 Days Fixed</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 8px;">
                            <span>Total Gross Payout:</span> <strong style="color: #38BDF8;">140% of Deposit</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 8px;">
                            <span>Net ROI Profit:</span> <strong style="color: #00FFA3;">40% Pure Gain</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span>Re-Topup Facility:</span> <strong style="color: #FFFFFF;">Available Anytime</strong>
                        </div>
                    </div>
                </div>
            </div>

            <div class="visual-box">
                <img src="{crypto_trading_b64 if 'crypto_trading_b64' in locals() else trading_b64}" alt="Trading Screen">
            </div>
        </div>
    </div>
    {generate_footer("Income 1: 5% Daily ROI (28-Day Tenure)", 11)}
</div>

<!-- ==================== SLIDE 12: INCOME 2 - FIX DEPOSIT (FD) OVERVIEW ==================== -->
<div class="slide">
    {generate_header("Income Stream #2")}
    <div class="slide-content">
        <div class="category-title">Institutional Staking Contracts</div>
        <h2 class="main-title">Fix Deposit (FD) Income: 10% & 15% Daily</h2>
        <p class="subtitle">Lock your capital in premier institutional liquidity pools and earn supercharged daily yields with contractual guarantees.</p>

        <div class="grid-2" style="margin-top: 14px;">
            <!-- FD Option 1 -->
            <div class="card card-cyan" style="padding: 44px; border: 2px solid #00D2FF;">
                <div style="background: rgba(0, 210, 255, 0.15); color: #38BDF8; display: inline-block; padding: 8px 24px; border-radius: 999px; font-size: 16px; font-weight: 800; letter-spacing: 2px; margin-bottom: 20px;">FD PLAN A</div>
                <div style="font-size: 76px; font-weight: 900; color: #38BDF8; font-family: 'Space Grotesk', sans-serif; line-height: 1; margin-bottom: 10px;">10% <span style="font-size: 28px; color: #FFFFFF;">DAILY</span></div>
                <div style="font-size: 22px; color: #94A3B8; font-weight: 700; margin-bottom: 26px;">Contract Duration: 180 Days</div>

                <div style="background: rgba(3, 7, 18, 0.45); border-radius: 18px; padding: 24px; display: flex; flex-direction: column; gap: 14px; font-size: 20px;">
                    <div style="display: flex; justify-content: space-between;"><span>Daily Credited Yield:</span> <strong style="color: #38BDF8;">10% Daily</strong></div>
                    <div style="display: flex; justify-content: space-between;"><span>Total Contract Return:</span> <strong style="color: #00FFA3;">1,800% Total</strong></div>
                    <div style="display: flex; justify-content: space-between;"><span>Capital Lock:</span> <strong>Maturity Payout</strong></div>
                    <div style="display: flex; justify-content: space-between;"><span>Level Income on FD:</span> <strong style="color: #00FFA3;">Full Royalty Active</strong></div>
                </div>
            </div>

            <!-- FD Option 2 -->
            <div class="card card-emerald" style="padding: 44px; border: 2px solid #00FFA3;">
                <div style="background: rgba(0, 255, 163, 0.2); color: #00FFA3; display: inline-block; padding: 8px 24px; border-radius: 999px; font-size: 16px; font-weight: 900; letter-spacing: 2px; margin-bottom: 20px;">FD PLAN B (VIP)</div>
                <div style="font-size: 76px; font-weight: 900; color: #00FFA3; font-family: 'Space Grotesk', sans-serif; line-height: 1; margin-bottom: 10px;">15% <span style="font-size: 28px; color: #FFFFFF;">DAILY</span></div>
                <div style="font-size: 22px; color: #94A3B8; font-weight: 700; margin-bottom: 26px;">Contract Duration: 210 Days</div>

                <div style="background: rgba(3, 7, 18, 0.45); border-radius: 18px; padding: 24px; display: flex; flex-direction: column; gap: 14px; font-size: 20px;">
                    <div style="display: flex; justify-content: space-between;"><span>Daily Credited Yield:</span> <strong style="color: #00FFA3;">15% Daily</strong></div>
                    <div style="display: flex; justify-content: space-between;"><span>Total Contract Return:</span> <strong style="color: #38BDF8;">3,150% Total</strong></div>
                    <div style="display: flex; justify-content: space-between;"><span>Capital Lock:</span> <strong>Maturity Payout</strong></div>
                    <div style="display: flex; justify-content: space-between;"><span>Level Income on FD:</span> <strong style="color: #00FFA3;">Full Royalty Active</strong></div>
                </div>
            </div>
        </div>
    </div>
    {generate_footer("Income 2: Fix Deposit (FD) High-Yield Overview", 12)}
</div>

<!-- ==================== SLIDE 13: FD PLAN A - 10% DAILY PACKAGES ==================== -->
<div class="slide">
    {generate_header("FD 180-Day Plan")}
    <div class="slide-content">
        <div class="category-title">180 Days Contract Tenure</div>
        <h2 class="main-title">FD Plan A: 10% Daily ROI Breakdown</h2>
        <p class="subtitle">Complete tier-by-tier calculation of daily income and total 180-day returns in USDT (BEP-20).</p>

        <table class="custom-table" style="margin-top: 10px;">
            <thead>
                <tr>
                    <th>FD Tier Deposit</th>
                    <th>Daily Return (10%)</th>
                    <th>30 Days Profit</th>
                    <th>90 Days Profit</th>
                    <th>Total 180 Days Return</th>
                    <th>Multiple</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong style="color: #FFFFFF;">$50 USDT</strong></td>
                    <td><strong style="color: #00FFA3;">$5.00 / day</strong></td>
                    <td>$150.00</td>
                    <td>$450.00</td>
                    <td><strong style="color: #38BDF8;">$900.00 USDT</strong></td>
                    <td><span style="color: #00FFA3; font-weight: 800;">18X Return</span></td>
                </tr>
                <tr>
                    <td><strong style="color: #FFFFFF;">$100 USDT</strong></td>
                    <td><strong style="color: #00FFA3;">$10.00 / day</strong></td>
                    <td>$300.00</td>
                    <td>$900.00</td>
                    <td><strong style="color: #38BDF8;">$1,800.00 USDT</strong></td>
                    <td><span style="color: #00FFA3; font-weight: 800;">18X Return</span></td>
                </tr>
                <tr>
                    <td><strong style="color: #FFFFFF;">$200 USDT</strong></td>
                    <td><strong style="color: #00FFA3;">$20.00 / day</strong></td>
                    <td>$600.00</td>
                    <td>$1,800.00</td>
                    <td><strong style="color: #38BDF8;">$3,600.00 USDT</strong></td>
                    <td><span style="color: #00FFA3; font-weight: 800;">18X Return</span></td>
                </tr>
                <tr>
                    <td><strong style="color: #38BDF8;">$500 USDT</strong></td>
                    <td><strong style="color: #00FFA3;">$50.00 / day</strong></td>
                    <td>$1,500.00</td>
                    <td>$4,500.00</td>
                    <td><strong style="color: #38BDF8;">$9,000.00 USDT</strong></td>
                    <td><span style="color: #00FFA3; font-weight: 800;">18X Return</span></td>
                </tr>
                <tr>
                    <td><strong style="color: #38BDF8;">$1,000 USDT</strong></td>
                    <td><strong style="color: #00FFA3;">$100.00 / day</strong></td>
                    <td>$3,000.00</td>
                    <td>$9,000.00</td>
                    <td><strong style="color: #38BDF8;">$18,000.00 USDT</strong></td>
                    <td><span style="color: #00FFA3; font-weight: 800;">18X Return</span></td>
                </tr>
                <tr>
                    <td><strong style="color: #38BDF8;">$2,000 USDT</strong></td>
                    <td><strong style="color: #00FFA3;">$200.00 / day</strong></td>
                    <td>$6,000.00</td>
                    <td>$18,000.00</td>
                    <td><strong style="color: #38BDF8;">$36,000.00 USDT</strong></td>
                    <td><span style="color: #00FFA3; font-weight: 800;">18X Return</span></td>
                </tr>
                <tr style="background: rgba(0, 255, 163, 0.12);">
                    <td><strong style="color: #00FFA3;">$5,000 USDT</strong></td>
                    <td><strong style="color: #00FFA3;">$500.00 / day</strong></td>
                    <td>$15,000.00</td>
                    <td>$45,000.00</td>
                    <td><strong style="color: #38BDF8;">$90,000.00 USDT</strong></td>
                    <td><span style="color: #00FFA3; font-weight: 900;">18X Return</span></td>
                </tr>
            </tbody>
        </table>
    </div>
    {generate_footer("FD Plan A: 10% Daily ROI Tier Breakdown", 13)}
</div>

<!-- ==================== SLIDE 14: FD PLAN B - 15% DAILY PACKAGES ==================== -->
<div class="slide">
    {generate_header("FD 210-Day VIP Plan")}
    <div class="slide-content">
        <div class="category-title">210 Days VIP Staking</div>
        <h2 class="main-title">FD Plan B: 15% Daily ROI Breakdown</h2>
        <p class="subtitle">Our most lucrative fixed contract offering explosive wealth multiplication for serious investors.</p>

        <table class="custom-table" style="margin-top: 10px;">
            <thead>
                <tr>
                    <th>FD Tier Deposit</th>
                    <th>Daily Return (15%)</th>
                    <th>30 Days Profit</th>
                    <th>90 Days Profit</th>
                    <th>Total 210 Days Return</th>
                    <th>Multiple</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong style="color: #FFFFFF;">$50 USDT</strong></td>
                    <td><strong style="color: #00FFA3;">$7.50 / day</strong></td>
                    <td>$225.00</td>
                    <td>$675.00</td>
                    <td><strong style="color: #38BDF8;">$1,575.00 USDT</strong></td>
                    <td><span style="color: #00FFA3; font-weight: 800;">31.5X Return</span></td>
                </tr>
                <tr>
                    <td><strong style="color: #FFFFFF;">$100 USDT</strong></td>
                    <td><strong style="color: #00FFA3;">$15.00 / day</strong></td>
                    <td>$450.00</td>
                    <td>$1,350.00</td>
                    <td><strong style="color: #38BDF8;">$3,150.00 USDT</strong></td>
                    <td><span style="color: #00FFA3; font-weight: 800;">31.5X Return</span></td>
                </tr>
                <tr>
                    <td><strong style="color: #FFFFFF;">$200 USDT</strong></td>
                    <td><strong style="color: #00FFA3;">$30.00 / day</strong></td>
                    <td>$900.00</td>
                    <td>$2,700.00</td>
                    <td><strong style="color: #38BDF8;">$6,300.00 USDT</strong></td>
                    <td><span style="color: #00FFA3; font-weight: 800;">31.5X Return</span></td>
                </tr>
                <tr>
                    <td><strong style="color: #38BDF8;">$500 USDT</strong></td>
                    <td><strong style="color: #00FFA3;">$75.00 / day</strong></td>
                    <td>$2,250.00</td>
                    <td>$6,750.00</td>
                    <td><strong style="color: #38BDF8;">$15,750.00 USDT</strong></td>
                    <td><span style="color: #00FFA3; font-weight: 800;">31.5X Return</span></td>
                </tr>
                <tr>
                    <td><strong style="color: #38BDF8;">$1,000 USDT</strong></td>
                    <td><strong style="color: #00FFA3;">$150.00 / day</strong></td>
                    <td>$4,500.00</td>
                    <td>$13,500.00</td>
                    <td><strong style="color: #38BDF8;">$31,500.00 USDT</strong></td>
                    <td><span style="color: #00FFA3; font-weight: 800;">31.5X Return</span></td>
                </tr>
                <tr>
                    <td><strong style="color: #38BDF8;">$2,000 USDT</strong></td>
                    <td><strong style="color: #00FFA3;">$300.00 / day</strong></td>
                    <td>$9,000.00</td>
                    <td>$27,000.00</td>
                    <td><strong style="color: #38BDF8;">$63,000.00 USDT</strong></td>
                    <td><span style="color: #00FFA3; font-weight: 800;">31.5X Return</span></td>
                </tr>
                <tr style="background: rgba(0, 255, 163, 0.15);">
                    <td><strong style="color: #00FFA3;">$5,000 USDT</strong></td>
                    <td><strong style="color: #00FFA3;">$750.00 / day</strong></td>
                    <td>$22,500.00</td>
                    <td>$67,500.00</td>
                    <td><strong style="color: #38BDF8;">$157,500.00 USDT</strong></td>
                    <td><span style="color: #00FFA3; font-weight: 900;">31.5X Return</span></td>
                </tr>
            </tbody>
        </table>
    </div>
    {generate_footer("FD Plan B: 15% Daily ROI VIP Tier Breakdown", 14)}
</div>

<!-- ==================== SLIDE 15: INCOME 3 - DIRECT REFERRAL (10%) ==================== -->
<div class="slide">
    {generate_header("Income Stream #3")}
    <div class="slide-content">
        <div class="category-title">Instant Cash Compensation</div>
        <h2 class="main-title">Direct Referral Income: 10% Instant</h2>
        <p class="subtitle">Earn a generous 10% instant commission in USDT (BEP-20) on every personal partner activation without limits.</p>

        <div class="grid-2" style="align-items: center; margin-top: 10px;">
            <div style="display: flex; flex-direction: column; gap: 20px;">
                <div class="card card-emerald" style="padding: 34px;">
                    <div style="font-size: 60px; font-weight: 900; color: #00FFA3; line-height: 1; margin-bottom: 10px;">10% INSTANT</div>
                    <div style="font-size: 24px; color: #FFFFFF; font-weight: 800; margin-bottom: 12px;">Direct Wallet Credit Upon Deposit</div>
                    <p style="font-size: 19px; color: #94A3B8; line-height: 1.5;">
                        Share the opportunity with partners, friends, and investors. The moment they activate any package from $5 to $5,000, 10% of their package amount is instantly credited to your withdrawal wallet!
                    </p>
                </div>

                <div class="card" style="padding: 28px;">
                    <h4 style="font-size: 20px; font-weight: 800; color: #38BDF8; margin-bottom: 14px; text-transform: uppercase;">Direct Earning Examples</h4>
                    <div style="display: flex; flex-direction: column; gap: 10px; font-size: 19px;">
                        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 6px;">
                            <span>Direct Refer $100 Package:</span> <strong style="color: #00FFA3;">+$10.00 USDT Instant</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 6px;">
                            <span>Direct Refer $500 Package:</span> <strong style="color: #00FFA3;">+$50.00 USDT Instant</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 6px;">
                            <span>Direct Refer $1,000 Package:</span> <strong style="color: #00FFA3;">+$100.00 USDT Instant</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span>Direct Refer $5,000 Package:</span> <strong style="color: #00FFA3;">+$500.00 USDT Instant</strong>
                        </div>
                    </div>
                </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 20px;">
                <div class="card card-cyan" style="padding: 44px; text-align: center;">
                    <div style="font-size: 64px; margin-bottom: 14px;">🚀</div>
                    <h3 style="font-size: 32px; font-weight: 900; color: #38BDF8; margin-bottom: 12px;">Unlimited Direct Potential</h3>
                    <p style="font-size: 20px; color: #94A3B8; line-height: 1.5;">
                        There is NO cap on how many direct partners you can introduce. Refer 10 leaders with $1,000 packages and earn <strong style="color: #00FFA3;">$1,000 USDT</strong> instantly!
                    </p>
                </div>

                <div class="card card-emerald" style="padding: 34px; text-align: center;">
                    <div style="font-size: 26px; font-weight: 900; color: #00FFA3; margin-bottom: 8px;">100% WITHDRAWABLE IMMEDIATELY</div>
                    <p style="font-size: 19px; color: #94A3B8;">Zero waiting period • Instant P2P or BEP-20 withdrawal</p>
                </div>
            </div>
        </div>
    </div>
    {generate_footer("Income 3: 10% Instant Direct Referral Income", 15)}
</div>

<!-- ==================== SLIDE 16: INCOME 4 - DAILY 12-LEVEL TEAM ROYALTY ==================== -->
<div class="slide">
    {generate_header("Income Stream #4")}
    <div class="slide-content">
        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 8px;">
            <div>
                <div class="category-title">Generational Team Wealth</div>
                <h2 class="main-title" style="margin-bottom: 0;">Daily 12-Level Team Royalty</h2>
            </div>
            <div style="background: rgba(0, 210, 255, 0.15); border: 2px solid #00D2FF; padding: 6px 20px; border-radius: 999px;">
                <span style="color: #38BDF8; font-weight: 800; font-size: 15px;">DIRECT QUALIFIER: $50+ ID UNLOCKS ALL 12 DOWNLINE LEVELS!</span>
            </div>
        </div>
        <p class="subtitle" style="margin-bottom: 14px;">Receive daily passive income derived from the daily ROI earnings of your entire 12-generation downline organization.</p>

        <div class="grid-2" style="align-items: center;">
            <div style="display: flex; flex-direction: column; gap: 20px;">
                <div class="card card-cyan" style="padding: 34px;">
                    <div style="font-size: 44px; font-weight: 900; color: #38BDF8; line-height: 1; margin-bottom: 10px;">DAILY PASSIVE CASH FLOW</div>
                    <div style="font-size: 22px; color: #FFFFFF; font-weight: 800; margin-bottom: 12px;">Paid Every Single Day (Mon-Sun)</div>
                    <p style="font-size: 19px; color: #94A3B8; line-height: 1.5;">
                        Unlike one-time bonuses, the 12-Level Income pays you every day whenever your team members earn their daily ROI. As your team grows, your daily recurring income explodes!
                    </p>
                </div>

                <div class="card" style="padding: 26px;">
                    <h4 style="font-size: 20px; font-weight: 800; color: #00FFA3; margin-bottom: 12px; text-transform: uppercase;">Key Royalty Rules</h4>
                    <div style="display: flex; flex-direction: column; gap: 10px; font-size: 18px;">
                        <div style="display: flex; gap: 12px;"><span>✅</span> <span>Royalty calculated daily on your downline's daily ROI yield</span></div>
                        <div style="display: flex; gap: 12px;"><span>✅</span> <span>1 Direct Referral unlocks each progressive level</span></div>
                        <div style="display: flex; gap: 12px;"><span>✅</span> <span>Total 12 Direct Referrals unlock all 12 Levels forever</span></div>
                        <div style="display: flex; gap: 12px;"><span>✅</span> <span>Zero flushing, zero lapse of downline volume</span></div>
                    </div>
                </div>
            </div>

            <div class="card card-emerald" style="padding: 34px;">
                <h3 style="font-size: 28px; font-weight: 900; color: #00FFA3; margin-bottom: 22px; text-align: center; text-transform: uppercase; letter-spacing: 1px;">Exponential Network Power</h3>
                <div style="display: flex; flex-direction: column; gap: 16px; font-size: 22px;">
                    <div style="display: flex; justify-content: space-between; padding: 14px 20px; background: rgba(3,7,18,0.5); border-radius: 14px; border-left: 4px solid #00FFA3;">
                        <span>Level 1 (Direct Team):</span> <strong style="color: #00FFA3;">5% Daily</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 14px 20px; background: rgba(3,7,18,0.5); border-radius: 14px; border-left: 4px solid #00D2FF;">
                        <span>Level 2 (Secondary Team):</span> <strong style="color: #38BDF8;">3% Daily</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 14px 20px; background: rgba(3,7,18,0.5); border-radius: 14px; border-left: 4px solid #00FFA3;">
                        <span>Level 3 to Level 6:</span> <strong style="color: #00FFA3;">2% Daily each</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 14px 20px; background: rgba(3,7,18,0.5); border-radius: 14px; border-left: 4px solid #38BDF8;">
                        <span>Level 7 to Level 12:</span> <strong style="color: #38BDF8;">1% Daily each</strong>
                    </div>
                </div>
            </div>
        </div>
    </div>
    {generate_footer("Income 4: Daily 12-Level Team Royalty Overview", 16)}
</div>

<!-- ==================== SLIDE 17: 12-LEVEL PERCENTAGE & CONDITION TABLE ==================== -->
<div class="slide">
    {generate_header("Level Structure")}
    <div class="slide-content">
        <div class="category-title">Full 12-Tier Distribution</div>
        <h2 class="main-title">12-Level Royalty Matrix & Unlock Conditions</h2>
        <p class="subtitle">Every direct referral unlocks another level of daily lifetime team royalty.</p>

        <table class="custom-table" style="margin-top: 6px;">
            <thead>
                <tr>
                    <th>Level</th>
                    <th>Daily Royalty (%)</th>
                    <th>Direct Referral Condition</th>
                    <th>Cumulative Directs</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong style="color: #00FFA3;">Level 1</strong></td>
                    <td><strong style="color: #00FFA3; font-size: 21px;">5% Daily</strong></td>
                    <td>1 Direct Referral</td>
                    <td>1 Direct</td>
                    <td><span style="color: #00FFA3; font-weight: 800;">ACTIVE</span></td>
                </tr>
                <tr>
                    <td><strong style="color: #38BDF8;">Level 2</strong></td>
                    <td><strong style="color: #38BDF8; font-size: 21px;">3% Daily</strong></td>
                    <td>+1 Direct Referral</td>
                    <td>2 Directs</td>
                    <td><span style="color: #00FFA3; font-weight: 800;">ACTIVE</span></td>
                </tr>
                <tr>
                    <td><strong style="color: #00FFA3;">Level 3</strong></td>
                    <td><strong style="color: #00FFA3; font-size: 21px;">2% Daily</strong></td>
                    <td>+1 Direct Referral</td>
                    <td>3 Directs</td>
                    <td><span style="color: #00FFA3; font-weight: 800;">ACTIVE</span></td>
                </tr>
                <tr>
                    <td><strong style="color: #00FFA3;">Level 4</strong></td>
                    <td><strong style="color: #00FFA3; font-size: 21px;">2% Daily</strong></td>
                    <td>+1 Direct Referral</td>
                    <td>4 Directs</td>
                    <td><span style="color: #00FFA3; font-weight: 800;">ACTIVE</span></td>
                </tr>
                <tr>
                    <td><strong style="color: #00FFA3;">Level 5</strong></td>
                    <td><strong style="color: #00FFA3; font-size: 21px;">2% Daily</strong></td>
                    <td>+1 Direct Referral</td>
                    <td>5 Directs</td>
                    <td><span style="color: #00FFA3; font-weight: 800;">ACTIVE</span></td>
                </tr>
                <tr>
                    <td><strong style="color: #00FFA3;">Level 6</strong></td>
                    <td><strong style="color: #00FFA3; font-size: 21px;">2% Daily</strong></td>
                    <td>+1 Direct Referral</td>
                    <td>6 Directs</td>
                    <td><span style="color: #00FFA3; font-weight: 800;">ACTIVE</span></td>
                </tr>
                <tr>
                    <td><strong style="color: #38BDF8;">Level 7 to Level 12</strong></td>
                    <td><strong style="color: #38BDF8; font-size: 21px;">1% Daily (Each Level)</strong></td>
                    <td>+1 Direct Referral per Level</td>
                    <td>12 Directs Total</td>
                    <td><span style="color: #00FFA3; font-weight: 900;">ALL LEVELS UNLOCKED</span></td>
                </tr>
            </tbody>
        </table>

        <div style="background: rgba(0, 255, 163, 0.12); border: 1.5px solid #00FFA3; border-radius: 14px; padding: 14px 24px; margin-top: 14px;">
            <strong style="color: #00FFA3;">DIRECT QUALIFIER REQUIREMENT:</strong>
            <span style="font-size: 18px; color: #94A3B8;"> Each referral ID must be $50 USDT or higher to unlock all 12 levels of team royalty (member's personal ID can be as low as $10 USDT).</span>
        </div>
    </div>
    {generate_footer("Complete 12-Level Percentage & Directs Criteria", 17)}
</div>

<!-- ==================== SLIDE 18: INCOME 5 - MEGA MILESTONE REWARDS ==================== -->
<div class="slide">
    {generate_header("Income Stream #5")}
    <div class="slide-content">
        <div class="category-title">Leadership Recognition</div>
        <h2 class="main-title">Mega Milestone & Rank Rewards</h2>
        <p class="subtitle">Accelerate your status with Crypto Finance. Hit team turnover milestones and win prestigious luxury assets or instant USDT cash!</p>

        <div class="grid-2" style="align-items: center; margin-top: 10px;">
            <div style="display: flex; flex-direction: column; gap: 20px;">
                <div class="card card-emerald" style="padding: 36px;">
                    <div style="font-size: 46px; font-weight: 900; color: #00FFA3; line-height: 1; margin-bottom: 10px;">LUXURY VIP LIFESTYLE</div>
                    <div style="font-size: 22px; color: #FFFFFF; font-weight: 800; margin-bottom: 14px;">Guaranteed Physical Gifts or Cash Equivalent</div>
                    <p style="font-size: 19px; color: #94A3B8; line-height: 1.5;">
                        As your network expands and business volume compounds, Crypto Finance honors your dedication with elite rewards: from Smart Gadgets and Swiss Tours to Luxury Watches and Elite Sports Cars!
                    </p>
                </div>

                <div class="card" style="padding: 28px;">
                    <h4 style="font-size: 20px; font-weight: 800; color: #38BDF8; margin-bottom: 14px; text-transform: uppercase;">Leadership Advantages</h4>
                    <div style="display: flex; flex-direction: column; gap: 10px; font-size: 18px;">
                        <div style="display: flex; gap: 12px;"><span>🏆</span> <span>Cumulative team business counts towards rank achievement</span></div>
                        <div style="display: flex; gap: 12px;"><span>💵</span> <span>Choose between physical reward or 100% instant USDT payout</span></div>
                        <div style="display: flex; gap: 12px;"><span>✈️</span> <span>VIP invitations to Annual European Leadership Summits (Zurich & Geneva)</span></div>
                    </div>
                </div>
            </div>

            <div class="visual-box">
                <img src="{rewards_b64}" alt="Luxury Rewards">
            </div>
        </div>
    </div>
    {generate_footer("Income 5: Mega Milestone Rewards Overview", 18)}
</div>

<!-- ==================== SLIDE 19: REWARDS MATRIX TABLE ==================== -->
<div class="slide">
    {generate_header("Reward Matrix")}
    <div class="slide-content">
        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 8px;">
            <div>
                <div class="category-title">Turnover Milestones</div>
                <h2 class="main-title" style="margin-bottom: 0;">Milestone Rewards Structure</h2>
            </div>
            <div style="background: rgba(0, 210, 255, 0.15); border: 2px solid #00D2FF; padding: 6px 20px; border-radius: 999px;">
                <span style="color: #38BDF8; font-weight: 800; font-size: 16px;">TEAM BUSINESS: 50% STRONG LEG / 50% WEAK LEG</span>
            </div>
        </div>
        <p class="subtitle" style="margin-bottom: 12px;">Progress through prestigious leadership ranks and unlock life-changing rewards.</p>

        <table class="custom-table">
            <thead>
                <tr>
                    <th>Rank Title</th>
                    <th>TEAM BUSINESS (Strong Leg)</th>
                    <th>TEAM BUSINESS (Weak Leg)</th>
                    <th>Guaranteed Reward</th>
                    <th>Cash Equivalent (USDT)</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong style="color: #FFFFFF;">⭐ Star Leader</strong></td>
                    <td>$500 USDT</td>
                    <td>$500 USDT</td>
                    <td>Premium Smart Watch</td>
                    <td><strong style="color: #00FFA3;">$25 USDT</strong></td>
                </tr>
                <tr>
                    <td><strong style="color: #38BDF8;">🥈 Silver Leader</strong></td>
                    <td>$1,250 USDT</td>
                    <td>$1,250 USDT</td>
                    <td>5G Android Smartphone</td>
                    <td><strong style="color: #00FFA3;">$125 USDT</strong></td>
                </tr>
                <tr>
                    <td><strong style="color: #00FFA3;">🥇 Gold Leader</strong></td>
                    <td>$2,500 USDT</td>
                    <td>$2,500 USDT</td>
                    <td>Apple iPad / Business Laptop</td>
                    <td><strong style="color: #00FFA3;">$250 USDT</strong></td>
                </tr>
                <tr>
                    <td><strong style="color: #38BDF8;">💎 Ruby Director</strong></td>
                    <td>$5,000 USDT</td>
                    <td>$5,000 USDT</td>
                    <td>All-Expense Paid Swiss Alpine & Zurich VIP Tour (3N/4D)</td>
                    <td><strong style="color: #00FFA3;">$500 USDT</strong></td>
                </tr>
                <tr>
                    <td><strong style="color: #00FFA3;">👑 Emerald Director</strong></td>
                    <td>$12,500 USDT</td>
                    <td>$12,500 USDT</td>
                    <td>Luxury Gold Watch / iPhone Pro Max</td>
                    <td><strong style="color: #00FFA3;">$1,250 USDT</strong></td>
                </tr>
                <tr>
                    <td><strong style="color: #38BDF8;">💠 Diamond Director</strong></td>
                    <td>$25,000 USDT</td>
                    <td>$25,000 USDT</td>
                    <td>International Luxury Holiday (Europe/Bali)</td>
                    <td><strong style="color: #00FFA3;">$2,500 USDT</strong></td>
                </tr>
                <tr>
                    <td><strong style="color: #FBBF24;">🏆 Blue Diamond</strong></td>
                    <td>$50,000 USDT</td>
                    <td>$50,000 USDT</td>
                    <td>Sedan Car Fund / Royal Gold Bullion</td>
                    <td><strong style="color: #00FFA3;">$5,000 USDT</strong></td>
                </tr>
                <tr style="background: rgba(0, 255, 163, 0.12);">
                    <td><strong style="color: #00FFA3;">👑 Crown King President</strong></td>
                    <td>$125,000 USDT</td>
                    <td>$125,000 USDT</td>
                    <td>Luxury Sports Car (Porsche / BMW / Mercedes)</td>
                    <td><strong style="color: #00FFA3; font-size: 24px;">$12,500 USDT</strong></td>
                </tr>
            </tbody>
        </table>
    </div>
    {generate_footer("Complete Milestone Rewards Schedule", 19)}
</div>

<!-- ==================== SLIDE 20: BLOCKCHAIN DEPOSIT & P2P SYSTEM ==================== -->
<div class="slide">
    {generate_header("Ecosystem Infrastructure")}
    <div class="slide-content">
        <div class="category-title">Decentralized Power</div>
        <h2 class="main-title">USDT BEP-20 Network & P2P Ecosystem</h2>
        <p class="subtitle">Experience frictionless global transactions powered by the ultra-fast, low-gas Binance Smart Chain.</p>

        <div class="grid-2" style="align-items: center; margin-top: 10px;">
            <div class="visual-box">
                <img src="{blockchain_b64}" alt="Blockchain Infrastructure">
            </div>

            <div style="display: flex; flex-direction: column; gap: 20px;">
                <div class="card card-emerald" style="padding: 30px;">
                    <div style="display: flex; align-items: center; gap: 18px;">
                        <div style="font-size: 38px;">⚡</div>
                        <div>
                            <h3 style="font-size: 24px; font-weight: 800; color: #00FFA3;">Instant Automated Deposits</h3>
                            <p style="font-size: 18px; color: #94A3B8; margin-top: 4px;">Deposit USDT (BEP-20) seamlessly from Trust Wallet, MetaMask, Binance, or OKX.</p>
                        </div>
                    </div>
                </div>

                <div class="card card-cyan" style="padding: 30px;">
                    <div style="display: flex; align-items: center; gap: 18px;">
                        <div style="font-size: 38px;">🔄</div>
                        <div>
                            <h3 style="font-size: 24px; font-weight: 800; color: #38BDF8;">Zero-Fee P2P Wallet Transfer</h3>
                            <p style="font-size: 18px; color: #94A3B8; margin-top: 4px;">Transfer internal balance instantly to other members without any fee to activate new downline IDs.</p>
                        </div>
                    </div>
                </div>

                <div class="card card-emerald" style="padding: 30px;">
                    <div style="display: flex; align-items: center; gap: 18px;">
                        <div style="font-size: 38px;">🔒</div>
                        <div>
                            <h3 style="font-size: 24px; font-weight: 800; color: #00FFA3;">Maximum Security & Automation</h3>
                            <p style="font-size: 18px; color: #94A3B8; margin-top: 4px;">All transactions protected by decentralized cryptographic verification with 99.99% uptime.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    {generate_footer("Blockchain Infrastructure & P2P Transfers", 20)}
</div>

<!-- ==================== SLIDE 21: TERMS & CONDITIONS ==================== -->
<div class="slide">
    {generate_header("Transparency Protocol")}
    <div class="slide-content">
        <div class="category-title">Fair & Transparent Guidelines</div>
        <h2 class="main-title">Terms & Conditions</h2>
        <p class="subtitle">Clear, member-first rules ensuring seamless daily operation and guaranteed payout protection.</p>

        <div class="grid-2" style="margin-top: 8px;">
            <div class="card card-cyan" style="padding: 28px; display: flex; gap: 20px; align-items: flex-start;">
                <div style="font-size: 38px; width: 64px; height: 64px; border-radius: 16px; background: rgba(0, 210, 255, 0.15); display: flex; align-items: center; justify-content: center; border: 1px solid #00D2FF; flex-shrink: 0;">💳</div>
                <div>
                    <h3 style="font-size: 24px; font-weight: 800; color: #38BDF8; margin-bottom: 6px;">Withdrawal Limits</h3>
                    <p style="font-size: 18px; color: #94A3B8; line-height: 1.4;">
                        <strong>Minimum Withdrawal:</strong> <span style="color: #00FFA3;">$2 USDT</span><br>
                        <strong>Maximum Withdrawal:</strong> <span style="color: #00FFA3;">$5,000 USDT</span> per transaction.
                    </p>
                </div>
            </div>

            <div class="card card-emerald" style="padding: 28px; display: flex; gap: 20px; align-items: flex-start;">
                <div style="font-size: 38px; width: 64px; height: 64px; border-radius: 16px; background: rgba(0, 255, 163, 0.15); display: flex; align-items: center; justify-content: center; border: 1px solid #00FFA3; flex-shrink: 0;">⚙️</div>
                <div>
                    <h3 style="font-size: 24px; font-weight: 800; color: #00FFA3; margin-bottom: 6px;">Withdrawal Admin Charge</h3>
                    <p style="font-size: 18px; color: #94A3B8; line-height: 1.4;">
                        A flat <strong>10% Admin Charge</strong> applies on withdrawals to maintain liquidity reserve pools and server infrastructure.
                    </p>
                </div>
            </div>

            <div class="card card-cyan" style="padding: 28px; display: flex; gap: 20px; align-items: flex-start;">
                <div style="font-size: 38px; width: 64px; height: 64px; border-radius: 16px; background: rgba(0, 210, 255, 0.15); display: flex; align-items: center; justify-content: center; border: 1px solid #00D2FF; flex-shrink: 0;">🎁</div>
                <div>
                    <h3 style="font-size: 24px; font-weight: 800; color: #38BDF8; margin-bottom: 6px;">$0.50 Signup & Level Bonus</h3>
                    <p style="font-size: 18px; color: #94A3B8; line-height: 1.4;">
                        <strong>$0.50 Signup Bonus</strong> + <strong>$0.50/12-Level Bonus</strong> ($1 total distributed across 12 levels; usable on $20+ active IDs).
                    </p>
                </div>
            </div>

            <div class="card card-emerald" style="padding: 28px; display: flex; gap: 20px; align-items: flex-start;">
                <div style="font-size: 38px; width: 64px; height: 64px; border-radius: 16px; background: rgba(0, 255, 163, 0.15); display: flex; align-items: center; justify-content: center; border: 1px solid #00FFA3; flex-shrink: 0;">🔓</div>
                <div>
                    <h3 style="font-size: 24px; font-weight: 800; color: #00FFA3; margin-bottom: 6px;">No Withdrawal Conditions</h3>
                    <p style="font-size: 18px; color: #94A3B8; line-height: 1.4;">
                        No mandatory direct referrals required to withdraw your daily basic ROI income. Complete financial freedom for all investors!
                    </p>
                </div>
            </div>

            <div class="card card-cyan" style="padding: 28px; display: flex; gap: 20px; align-items: flex-start;">
                <div style="font-size: 38px; width: 64px; height: 64px; border-radius: 16px; background: rgba(0, 210, 255, 0.15); display: flex; align-items: center; justify-content: center; border: 1px solid #00D2FF; flex-shrink: 0;">⏳</div>
                <div>
                    <h3 style="font-size: 24px; font-weight: 800; color: #38BDF8; margin-bottom: 6px;">Tenure Duration: 28 Days</h3>
                    <p style="font-size: 18px; color: #94A3B8; line-height: 1.4;">
                        Basic ROI plans mature after <strong>28 Days (140% gross payout)</strong>. Members can re-topup and compound continuously.
                    </p>
                </div>
            </div>

            <div class="card card-emerald" style="padding: 28px; display: flex; gap: 20px; align-items: flex-start;">
                <div style="font-size: 38px; width: 64px; height: 64px; border-radius: 16px; background: rgba(0, 255, 163, 0.15); display: flex; align-items: center; justify-content: center; border: 1px solid #00FFA3; flex-shrink: 0;">🌐</div>
                <div>
                    <h3 style="font-size: 24px; font-weight: 800; color: #00FFA3; margin-bottom: 6px;">Standard Blockchain BEP-20</h3>
                    <p style="font-size: 18px; color: #94A3B8; line-height: 1.4;">
                        Operates strictly on the <strong>USDT (Binance Smart Chain BEP-20)</strong> standard for lightning speed and minimal network gas fees.
                    </p>
                </div>
            </div>
        </div>
    </div>
    {generate_footer("Official Transparency Terms & Protocols", 21)}
</div>

<!-- ==================== SLIDE 22: OFFICIAL CORPORATE CONTACT ==================== -->
<div class="slide">
    {generate_header("Global Headquarters")}
    <div class="slide-content">
        <div class="category-title">World-Class Presence</div>
        <h2 class="main-title">Global Corporate Headquarters</h2>
        <p class="subtitle">Located at the epicenter of international blockchain innovation in Crypto Valley, Zug / Zurich, Switzerland.</p>

        <div class="grid-2" style="align-items: center; margin-top: 10px;">
            <div style="display: flex; flex-direction: column; gap: 20px;">
                <div class="card card-emerald" style="padding: 30px;">
                    <div style="font-size: 16px; color: #94A3B8; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">Managing Leadership</div>
                    <div style="font-size: 34px; font-weight: 900; color: #00FFA3; font-family: 'Space Grotesk', sans-serif; margin-top: 6px;">Mr. Alex Rivera</div>
                    <div style="font-size: 18px; color: #38BDF8; font-weight: 700; margin-top: 2px;">Chairman & Managing Director</div>
                </div>

                <div class="card card-cyan" style="padding: 30px;">
                    <div style="font-size: 16px; color: #94A3B8; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">Physical Headquarters</div>
                    <div style="font-size: 24px; font-weight: 800; color: #FFFFFF; margin-top: 6px; line-height: 1.4;">
                        Crypto Valley Tower, Dammstrasse 19, 6300 Zug / Zurich, Switzerland
                    </div>
                </div>

                <div class="card" style="padding: 30px;">
                    <div style="font-size: 16px; color: #94A3B8; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">Official Communications</div>
                    <div style="font-size: 22px; font-weight: 800; color: #00FFA3; margin-top: 6px;">
                        📧 support@cryptofinance.online
                    </div>
                    <div style="font-size: 22px; font-weight: 800; color: #38BDF8; margin-top: 6px;">
                        🌐 cryptofinance.online
                    </div>
                </div>
            </div>

            <div class="visual-box">
                <img src="{office_b64}" alt="Crypto Valley Office">
                <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(3,7,18,0.95)); padding: 20px; text-align: center;">
                    <div style="color: #00FFA3; font-size: 22px; font-weight: 800;">CRYPTO FINANCE HEADQUARTERS</div>
                    <div style="color: #94A3B8; font-size: 16px; font-weight: 600;">Crypto Valley Tower, Zug / Zurich, Switzerland</div>
                </div>
            </div>
        </div>
    </div>
    {generate_footer("Global Corporate Headquarters", 22)}
</div>

<!-- ==================== SLIDE 23: CLOSING & CALL TO ACTION ==================== -->
<div class="slide" style="justify-content: center; align-items: center; text-align: center; background: linear-gradient(rgba(3, 7, 18, 0.82), rgba(3, 7, 18, 0.92)), url('{hero_b64}') center/cover no-repeat; padding: 80px;">
    <div style="background: rgba(0, 255, 163, 0.12); border: 2px solid #00FFA3; padding: 10px 32px; border-radius: 999px; margin-bottom: 24px; display: inline-flex; align-items: center; gap: 12px; box-shadow: 0 0 25px rgba(0, 255, 163, 0.25);">
        <span style="font-size: 26px;">⚜️</span>
        <span style="color: #00FFA3; font-size: 22px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;">A New Era • Financial Sovereignty</span>
    </div>

    <div style="margin-bottom: 16px;">
        <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polygon points="50,6 90,28 90,72 50,94 10,72 10,28" fill="#070D1F" stroke="#00FFA3" stroke-width="4.5"/>
            <polygon points="50,18 80,35 80,65 50,82 20,65 20,35" fill="none" stroke="rgba(0, 210, 255, 0.6)" stroke-width="2.5"/>
            <path d="M44 34 C30 34 28 44 28 50 C28 56 30 66 44 66" fill="none" stroke="#00FFA3" stroke-width="6" stroke-linecap="round"/>
            <path d="M54 34 L54 66 M54 34 L70 34 M54 49 L66 49" fill="none" stroke="#00D2FF" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    </div>

    <h1 style="font-family: 'Space Grotesk', sans-serif; font-size: 80px; font-weight: 900; color: #FFFFFF; line-height: 1.1; margin-bottom: 20px;">
        Thank You & Welcome to <br><span style="background: linear-gradient(135deg, #00FFA3 0%, #00D2FF 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Crypto Finance</span>
    </h1>

    <p style="font-size: 28px; color: #94A3B8; max-width: 1100px; line-height: 1.4; margin-bottom: 40px;">
        Join thousands of smart global investors achieving consistent, automated daily returns. Start your journey today with just <span style="color: #00FFA3; font-weight: 900;">$5 USDT</span>!
    </p>

    <div style="display: flex; gap: 24px; margin-bottom: 48px;">
        <div class="btn-emerald" style="font-size: 26px; padding: 20px 54px;">REGISTER ON CRYPTOFINANCE.ONLINE</div>
    </div>

    <div style="display: flex; gap: 48px; font-size: 22px; color: #94A3B8; font-weight: 700;">
        <div>🏢 Mr. Alex Rivera</div>
        <div>📍 Crypto Valley Tower, Zug / Zurich, Switzerland</div>
        <div>✉️ support@cryptofinance.online</div>
    </div>
</div>

</body>
</html>
"""

html_out_path = os.path.join(workspace, "crypto_finance_presentation.html")
with open(html_out_path, "w", encoding="utf-8") as f:
    f.write(html_content)
print(f"Written HTML successfully to {html_out_path} ({len(html_content)} bytes)")

# Compile to PDF using headless Chrome
chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
pdf_out_path = os.path.join(workspace, "Crypto_Finance_Presentation.pdf")
root_pdf_path = r"c:\Users\user\Desktop\CryptoFinance\Crypto_Finance_Presentation.pdf"

cmd = [
    chrome_path,
    "--headless=new",
    "--disable-gpu",
    "--no-pdf-header-footer",
    "--run-all-compositor-stages-before-draw",
    f"--print-to-pdf={pdf_out_path}",
    f"file:///{os.path.abspath(html_out_path)}"
]

print("Rendering PDF with headless Chrome...")
res = subprocess.run(cmd, capture_output=True, text=True)
print("Chrome return code:", res.returncode)

if os.path.exists(pdf_out_path):
    import shutil
    shutil.copyfile(pdf_out_path, root_pdf_path)
    print(f"Copied to root: {root_pdf_path}")
    
    doc = pymupdf.open(pdf_out_path)
    print(f"Generated PDF with {len(doc)} pages!")
    
    render_dir = os.path.join(workspace, "crypto_rendered_pages")
    os.makedirs(render_dir, exist_ok=True)
    for i, page in enumerate(doc):
        pix = page.get_pixmap(dpi=150)
        pix.save(os.path.join(render_dir, f"page_{i+1:02d}.png"))
    print(f"Rendered all {len(doc)} pages to {render_dir}/ for visual inspection!")
else:
    print("Error: PDF was not generated.")
