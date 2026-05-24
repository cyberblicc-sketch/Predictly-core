#!/usr/bin/env python3
"""
Predictly Launch Roadmap - Comprehensive Marketing & Launch Plan PDF Generator
Uses ReportLab for body, Playwright for cover, pypdf for merge.
"""

import os, sys, hashlib, subprocess
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch, cm
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY, TA_RIGHT
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle,
    KeepTogether, CondPageBreak, HRFlowable
)
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily

# ── Paths ──
PDF_SKILL_DIR = "/home/z/my-project/skills/pdf"
OUTPUT_DIR = "/home/z/my-project/download"
BODY_PDF = os.path.join(OUTPUT_DIR, "body.pdf")
COVER_HTML = os.path.join(OUTPUT_DIR, "cover.html")
COVER_PDF = os.path.join(OUTPUT_DIR, "cover.pdf")
FINAL_PDF = os.path.join(OUTPUT_DIR, "Predictly_Launch_Roadmap.pdf")

# ── Palette (from cascade: energy intent, minimal mode) ──
ACCENT       = colors.HexColor('#1f9359')
ACCENT_SEC   = colors.HexColor('#47d047')
TEXT_PRIMARY  = colors.HexColor('#242220')
TEXT_MUTED    = colors.HexColor('#87827d')
BG_PAGE       = colors.HexColor('#f5f4f4')
BG_SURFACE    = colors.HexColor('#f2f2f1')
CARD_BG       = colors.HexColor('#edeceb')
TABLE_STRIPE  = colors.HexColor('#f4f4f3')
HEADER_FILL   = colors.HexColor('#735f4b')
COVER_BLOCK   = colors.HexColor('#5d5246')
BORDER_COLOR  = colors.HexColor('#ccc1b6')
ICON_COLOR    = colors.HexColor('#947555')
SUCCESS_COLOR = colors.HexColor('#458d5d')
WARNING_COLOR = colors.HexColor('#927b4c')
ERROR_COLOR   = colors.HexColor('#9d5750')
INFO_COLOR    = colors.HexColor('#3e668e')

# ── Font Registration ──
# Liberation Serif = metric-compatible Times New Roman replacement
pdfmetrics.registerFont(TTFont('LiberationSerif', '/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf'))
pdfmetrics.registerFont(TTFont('LiberationSerif-Bold', '/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf'))
pdfmetrics.registerFont(TTFont('LiberationSerif-Italic', '/usr/share/fonts/truetype/liberation/LiberationSerif-Italic.ttf'))
pdfmetrics.registerFont(TTFont('LiberationSerif-BoldItalic', '/usr/share/fonts/truetype/liberation/LiberationSerif-BoldItalic.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSans', '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSans-Bold', '/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf'))
registerFontFamily('LiberationSerif', normal='LiberationSerif', bold='LiberationSerif-Bold', italic='LiberationSerif-Italic', boldItalic='LiberationSerif-BoldItalic')
registerFontFamily('DejaVuSans', normal='DejaVuSans', bold='DejaVuSans-Bold')

# ── Page Setup ──
PAGE_W, PAGE_H = A4
LEFT_MARGIN = 0.9 * inch
RIGHT_MARGIN = 0.9 * inch
TOP_MARGIN = 0.75 * inch
BOTTOM_MARGIN = 0.75 * inch
AVAILABLE_W = PAGE_W - LEFT_MARGIN - RIGHT_MARGIN

# ── Styles ──
styles = getSampleStyleSheet()

s_h1 = ParagraphStyle(
    'H1Custom', fontName='LiberationSerif', fontSize=20, leading=28,
    textColor=ACCENT, spaceBefore=18, spaceAfter=10, alignment=TA_LEFT
)
s_h2 = ParagraphStyle(
    'H2Custom', fontName='LiberationSerif', fontSize=14, leading=20,
    textColor=HEADER_FILL, spaceBefore=14, spaceAfter=8, alignment=TA_LEFT
)
s_h3 = ParagraphStyle(
    'H3Custom', fontName='LiberationSerif', fontSize=12, leading=17,
    textColor=ICON_COLOR, spaceBefore=10, spaceAfter=6, alignment=TA_LEFT
)
s_body = ParagraphStyle(
    'BodyCustom', fontName='LiberationSerif', fontSize=10.5, leading=17,
    textColor=TEXT_PRIMARY, spaceBefore=2, spaceAfter=6, alignment=TA_JUSTIFY
)
s_body_indent = ParagraphStyle(
    'BodyIndent', parent=s_body, leftIndent=18
)
s_bullet = ParagraphStyle(
    'BulletCustom', fontName='LiberationSerif', fontSize=10.5, leading=17,
    textColor=TEXT_PRIMARY, spaceBefore=1, spaceAfter=3,
    leftIndent=24, bulletIndent=12, alignment=TA_LEFT
)
s_sub_bullet = ParagraphStyle(
    'SubBulletCustom', fontName='LiberationSerif', fontSize=10, leading=16,
    textColor=TEXT_MUTED, spaceBefore=1, spaceAfter=2,
    leftIndent=42, bulletIndent=30, alignment=TA_LEFT
)
s_callout = ParagraphStyle(
    'CalloutCustom', fontName='LiberationSerif', fontSize=11, leading=18,
    textColor=ACCENT, spaceBefore=6, spaceAfter=6, leftIndent=24,
    borderColor=ACCENT, borderWidth=0, borderPadding=0, alignment=TA_LEFT
)
s_table_header = ParagraphStyle(
    'TableHeader', fontName='LiberationSerif', fontSize=10, leading=14,
    textColor=colors.white, alignment=TA_CENTER
)
s_table_cell = ParagraphStyle(
    'TableCell', fontName='LiberationSerif', fontSize=9.5, leading=14,
    textColor=TEXT_PRIMARY, alignment=TA_LEFT
)
s_table_cell_c = ParagraphStyle(
    'TableCellC', fontName='LiberationSerif', fontSize=9.5, leading=14,
    textColor=TEXT_PRIMARY, alignment=TA_CENTER
)
s_caption = ParagraphStyle(
    'CaptionCustom', fontName='LiberationSerif', fontSize=9, leading=13,
    textColor=TEXT_MUTED, spaceBefore=3, spaceAfter=6, alignment=TA_CENTER
)
s_quote = ParagraphStyle(
    'QuoteCustom', fontName='LiberationSerif', fontSize=10.5, leading=17,
    textColor=HEADER_FILL, spaceBefore=8, spaceAfter=8, leftIndent=30,
    borderColor=ACCENT, borderWidth=2, borderPadding=8, alignment=TA_LEFT
)
s_toc1 = ParagraphStyle(
    'TOC1', fontName='LiberationSerif', fontSize=13, leftIndent=20, leading=22
)
s_toc2 = ParagraphStyle(
    'TOC2', fontName='LiberationSerif', fontSize=11, leftIndent=40, leading=18
)

# ── Helper Functions ──
def h1(text):
    key = 'h_%s' % hashlib.md5(text.encode()).hexdigest()[:8]
    p = Paragraph('<a name="%s"/><b>%s</b>' % (key, text), s_h1)
    p.bookmark_name = text
    p.bookmark_level = 0
    p.bookmark_text = text
    p.bookmark_key = key
    return p

def h2(text):
    key = 'h_%s' % hashlib.md5(text.encode()).hexdigest()[:8]
    p = Paragraph('<a name="%s"/><b>%s</b>' % (key, text), s_h2)
    p.bookmark_name = text
    p.bookmark_level = 1
    p.bookmark_text = text
    p.bookmark_key = key
    return p

def h3(text):
    return Paragraph('<b>%s</b>' % text, s_h3)

def body(text):
    return Paragraph(text, s_body)

def bullet(text):
    return Paragraph('<bullet>&bull;</bullet> %s' % text, s_bullet)

def sub_bullet(text):
    return Paragraph('<bullet>-</bullet> %s' % text, s_sub_bullet)

def callout(text):
    return Paragraph('<b>%s</b>' % text, s_callout)

def quote(text):
    return Paragraph('<i>"%s"</i>' % text, s_quote)

def hr():
    return HRFlowable(width="100%", thickness=0.5, color=BORDER_COLOR, spaceBefore=6, spaceAfter=6)

def make_table(headers, rows, col_ratios=None):
    """Create a styled table with headers and rows."""
    n = len(headers)
    if col_ratios is None:
        col_ratios = [1.0/n] * n
    col_widths = [r * AVAILABLE_W for r in col_ratios]
    data = [[Paragraph('<b>%s</b>' % h, s_table_header) for h in headers]]
    for row in rows:
        data.append([Paragraph(str(c), s_table_cell) for c in row])
    t = Table(data, colWidths=col_widths, hAlign='CENTER')
    style_cmds = [
        ('BACKGROUND', (0, 0), (-1, 0), HEADER_FILL),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]
    for i in range(1, len(data)):
        bg = colors.white if i % 2 == 1 else TABLE_STRIPE
        style_cmds.append(('BACKGROUND', (0, i), (-1, i), bg))
    t.setStyle(TableStyle(style_cmds))
    return t

def safe_keep(elements):
    """KeepTogether with height safety."""
    total_h = 0
    for el in elements:
        w, h = el.wrap(AVAILABLE_W, PAGE_H)
        total_h += h
    if total_h <= PAGE_H * 0.4:
        return [KeepTogether(elements)]
    elif len(elements) >= 2:
        return [KeepTogether(elements[:2])] + list(elements[2:])
    return list(elements)

# ── TOC DocTemplate ──
class TocDocTemplate(SimpleDocTemplate):
    def afterFlowable(self, flowable):
        if hasattr(flowable, 'bookmark_name'):
            level = getattr(flowable, 'bookmark_level', 0)
            text = getattr(flowable, 'bookmark_text', '')
            key = getattr(flowable, 'bookmark_key', '')
            self.notify('TOCEntry', (level, text, self.page, key))

H1_ORPHAN_THRESHOLD = (PAGE_H - TOP_MARGIN - BOTTOM_MARGIN) * 0.15

def add_major_section(text):
    return [CondPageBreak(H1_ORPHAN_THRESHOLD), h1(text)]


# ══════════════════════════════════════════════════
#  BUILD THE DOCUMENT
# ══════════════════════════════════════════════════
doc = TocDocTemplate(
    BODY_PDF, pagesize=A4,
    leftMargin=LEFT_MARGIN, rightMargin=RIGHT_MARGIN,
    topMargin=TOP_MARGIN, bottomMargin=BOTTOM_MARGIN,
    title='Predictly Launch Roadmap',
    author='Z.ai', creator='Z.ai',
    subject='Comprehensive Marketing Roadmap and Launch Plan for Predictly Prediction Market Platform'
)

story = []

# ── TABLE OF CONTENTS ──
story.append(Paragraph('<b>Table of Contents</b>', ParagraphStyle(
    'TOCTitle', fontName='LiberationSerif', fontSize=22, leading=30,
    textColor=HEADER_FILL, spaceBefore=20, spaceAfter=16, alignment=TA_LEFT
)))
toc = TableOfContents()
toc.levelStyles = [s_toc1, s_toc2]
story.append(toc)
story.append(PageBreak())

# ══════════════════════════════════════════════════════════
# SECTION 1: PRE-LAUNCH STRATEGY (WEEKS 1-2)
# ══════════════════════════════════════════════════════════
story.extend(add_major_section('1. Pre-Launch Strategy (Weeks 1-2)'))

story.append(h2('1.1 Brand Positioning and Messaging'))
story.append(body(
    'Predictly occupies a unique position at the intersection of prediction markets and sweepstakes gaming. '
    'The brand must communicate three core pillars: <b>accessibility</b> (anyone can play, no crypto needed), '
    '<b>legality</b> (sweepstakes model works in 48+ US states), and <b>intelligence</b> (AI-powered agents '
    'provide real-time insights). The dual-currency system (Gold Coins for practice, Sweeps Coins for real '
    'rewards) is the key differentiator from competitors like Kalshi or Polymarket.'
))
story.append(Spacer(1, 6))
story.append(callout('Brand Promise: "Predict the future. Win for real."'))
story.append(Spacer(1, 4))

story.append(h3('Core Messaging Framework'))
story.append(make_table(
    ['Audience', 'Primary Message', 'Emotional Hook'],
    [
        ['Crypto/Finance', 'Trade outcomes, not just stocks. Zero fees on GC trades.', 'Smart money plays here.'],
        ['Politics', 'Put your prediction where your mouth is. Real rewards for being right.', 'Your political IQ has cash value.'],
        ['Sports Fans', 'Predict games beyond the scoreboard. Every play, every call.', 'You called it. Now cash in.'],
        ['Tech Enthusiasts', 'Bet on innovation timelines. AI, space, startups.', 'The future is predictable. Profit from it.'],
        ['General (18-34)', 'Free to play. Real to win. The smartest game on the internet.', 'Finally, being right pays off.'],
    ],
    [0.15, 0.45, 0.40]
))
story.append(Spacer(1, 12))

story.append(h2('1.2 Social Media Account Setup'))
story.append(body('Set up all accounts within the first 3 days. Consistency across platforms is critical for brand recognition.'))
story.append(Spacer(1, 4))
story.append(make_table(
    ['Platform', 'Handle', 'Bio Line', 'Priority', 'Setup Date'],
    [
        ['Twitter/X', '@PredictlyApp', 'Predict the future. Win for real. Dual-currency prediction market. #Predictly', 'HIGH', 'May 25'],
        ['Reddit', 'u/PredictlyOfficial', 'Official Predictly account - prediction markets for everyone', 'HIGH', 'May 25'],
        ['Discord', 'discord.gg/predictly', 'Predictly Community - Markets, Trading, Rewards', 'HIGH', 'May 26'],
        ['TikTok', '@PredictlyApp', 'Predict the future, win for real', 'MEDIUM', 'May 27'],
        ['Instagram', '@PredictlyApp', 'Prediction markets made simple', 'LOW', 'May 28'],
        ['YouTube', 'Predictly', 'Prediction market tutorials & market analysis', 'LOW', 'May 29'],
    ],
    [0.12, 0.15, 0.35, 0.10, 0.10]
))
story.append(Spacer(1, 4))
story.append(body('<b>Profile image:</b> Use the Predictly logo on all platforms. Cover images should feature the tagline "Predict the future. Win for real." with a market chart visual.'))
story.append(Spacer(1, 12))

story.append(h2('1.3 Content Calendar (Weeks 1-2)'))
story.append(body('Post cadence: Twitter 2x/day, Reddit 1x/day, TikTok 3x/week, Discord daily engagement. Below is the detailed day-by-day calendar.'))
story.append(Spacer(1, 4))

story.append(make_table(
    ['Day', 'Twitter/X Post 1', 'Twitter/X Post 2', 'Reddit Post', 'TikTok'],
    [
        ['Mon W1', 'Teaser: "Something big is coming to prediction markets..." #Predictly', 'Thread: Why dual-currency prediction markets are the future', 'r/PredictionMarkets: "What if prediction markets were free to play?"', ''],
        ['Tue W1', '"Gold Coins or Sweeps Coins? Why not both?" Explainer graphic', 'Poll: "Which market category excites you most? Politics/Crypto/Sports/Tech"', 'r/CryptoCurrency: "Prediction markets without crypto - possible?"', '15s: GC vs SC visual explainer'],
        ['Wed W1', 'Sneak peek: Market card design reveal #BuildInPublic', 'Thread: The legal landscape of prediction markets in the US', 'r/legaladvice: "Sweepstakes prediction markets - legal analysis"', ''],
        ['Thu W1', '"12 markets. 8 categories. 1 platform." Market categories reveal', 'Quote RT: Industry news about prediction markets + Predictly angle', 'r/sportsbook: "What if you could predict more than just scores?"', '30s: Market categories countdown'],
        ['Fri W1', 'Founder story: "Why I built Predictly as a solo founder" thread', 'Community question: "What market would you trade first?"', 'r/Entrepreneur: "Building a prediction market solo - my story"', ''],
        ['Mon W2', '"Meet Scout - your AI market analyst" Agent reveal #1', 'Thread: How AI agents give Predictly users an edge', 'r/artificial: "AI agents that analyze prediction markets"', '15s: Scout agent introduction'],
        ['Tue W2', '"Meet Oddsmaker - the AI that sets the lines" Agent reveal #2', 'Infographic: The 6 AI agents of Predictly', 'r/DataScience: "AI-powered odds making for prediction markets"', ''],
        ['Wed W2', 'Launch countdown: "7 days until Predictly" with daily teasers', 'Behind-the-scenes: Building the platform in 30 days', 'r/SideProject: "30-day build challenge: prediction market platform"', '30s: Build-in-public time lapse'],
        ['Thu W2', '"Meet Sentry - the AI that guards your portfolio" Agent reveal #3', 'User testimonial mockup: "I called the election AND won SC"', 'r/investing: "Prediction markets as an alternative investment thesis"', ''],
        ['Fri W2', '"3 days until launch." Urgency post with early access link', 'AMA announcement: "Ask me anything about Predictly - Monday 7pm ET"', 'r/AMA: "I built a legal prediction market platform - AMA Monday"', '15s: Launch countdown teaser'],
    ],
    [0.07, 0.27, 0.25, 0.24, 0.12]
))
story.append(Spacer(1, 12))

story.append(h2('1.4 Email List Building Strategy'))
story.append(body('Target: 500 email subscribers before launch day. The email list is the highest-converting channel for a bootstrap launch.'))
story.append(Spacer(1, 4))
story.append(bullet('<b>Launch landing page</b> (Day 1): "Get early access + 1,000 free Gold Coins" incentive. Use a simple single-field email capture.'))
story.append(bullet('<b>Twitter bio link</b>: Direct to landing page. Update immediately after account creation.'))
story.append(bullet('<b>Reddit "early access" posts</b>: Offer exclusive early access to r/PredictionMarkets members who sign up.'))
story.append(bullet('<b>Discord pre-launch channel</b>: Create #early-access channel. Email gate for full access.'))
story.append(bullet('<b>Referral waitlist</b>: "Skip the line by referring 3 friends" - positions 1-100 get bonus GC.'))
story.append(bullet('<b>ProductHunt "Coming Soon"</b>: List on PH 2 weeks before launch to capture email interest.'))
story.append(bullet('<b>Cold outreach</b>: DM 50 niche influencers with personalized "sneak peek" offer.'))
story.append(Spacer(1, 12))

story.append(h2('1.5 Influencer Outreach Plan'))
story.append(body('Target: 10 micro-influencers (1K-50K followers) in prediction markets, crypto, sports betting, and politics niches. Budget: $0 (equity/revenue-share or free access deals).'))
story.append(Spacer(1, 4))
story.append(make_table(
    ['Influencer Type', 'Platform', 'Offer', 'Expected ROI', 'Outreach Date'],
    [
        ['Crypto analysts', 'Twitter/X', 'Free SC + early access + affiliate link', '500-2,000 signups', 'May 26'],
        ['Sports bettors', 'YouTube/Twitter', 'Free SC + sponsored content deal', '300-1,000 signups', 'May 27'],
        ['Political commentators', 'Twitter/Substack', 'Exclusive market data access', '200-800 signups', 'May 28'],
        ['Finance YouTubers', 'YouTube', 'Revenue share on referrals', '500-1,500 signups', 'May 29'],
        ['TikTok creators', 'TikTok', 'Free GC/SC + affiliate program', '1,000-5,000 views', 'May 30'],
    ],
    [0.18, 0.15, 0.30, 0.20, 0.12]
))
story.append(Spacer(1, 12))

story.append(h2('1.6 SEO Foundation'))
story.append(h3('Target Keywords (Month 1)'))
story.append(make_table(
    ['Keyword', 'Search Volume', 'Difficulty', 'Content Type', 'Publish Date'],
    [
        ['prediction market', '12,100/mo', 'High', 'Blog: "What Is a Prediction Market?"', 'May 26'],
        ['free prediction market', '2,900/mo', 'Medium', 'Landing page optimization', 'May 27'],
        ['prediction market app', '1,900/mo', 'Medium', 'Blog: "Best Prediction Market Apps 2026"', 'May 28'],
        ['sweepstakes prediction market', '480/mo', 'Low', 'Blog: "Legal Prediction Markets: The Sweepstakes Model"', 'May 29'],
        ['predict politics for money', '720/mo', 'Low', 'Blog: "How to Predict Political Outcomes for Rewards"', 'May 30'],
        ['AI prediction market', '390/mo', 'Low', 'Blog: "AI-Powered Prediction Markets: The Future"', 'Jun 1'],
        ['dual currency prediction market', '110/mo', 'Very Low', 'Product page / FAQ', 'May 27'],
        ['gold coins sweeps coins', '260/mo', 'Low', 'Blog: "Gold Coins vs Sweeps Coins Explained"', 'May 28'],
    ],
    [0.28, 0.14, 0.12, 0.34, 0.12]
))
story.append(Spacer(1, 6))
story.append(h3('Meta Tags Template'))
story.append(body('<b>Title:</b> Predictly - Free Prediction Markets | Predict the Future, Win for Real'))
story.append(body('<b>Description:</b> Trade predictions on politics, crypto, sports, and tech with Predictly. Practice with Gold Coins, win real rewards with Sweeps Coins. Free to play, legal in most US states.'))
story.append(body('<b>OG Image:</b> Market card with "Predict the future. Win for real." tagline'))
story.append(Spacer(1, 18))


# ══════════════════════════════════════════════════════════
# SECTION 2: LAUNCH CAMPAIGN (WEEKS 3-4)
# ══════════════════════════════════════════════════════════
story.extend(add_major_section('2. Launch Campaign (Weeks 3-4)'))

story.append(h2('2.1 Launch Day Checklist'))
story.append(body('Target launch date: <b>June 7, 2026 (Sunday)</b> - Sunday launches capture weekend browsing traffic and allow Monday press pickup.'))
story.append(Spacer(1, 4))
story.append(make_table(
    ['Time (ET)', 'Task', 'Owner', 'Status'],
    [
        ['6:00 AM', 'Final production deploy + smoke test all 12 markets', 'Founder', '[ ]'],
        ['7:00 AM', 'Post launch tweet thread (25-part detailed thread)', 'Founder', '[ ]'],
        ['7:15 AM', 'Email blast to full subscriber list', 'Founder', '[ ]'],
        ['7:30 AM', 'Reddit post to r/PredictionMarkets + r/CryptoCurrency', 'Founder', '[ ]'],
        ['8:00 AM', 'ProductHunt launch goes live', 'Founder', '[ ]'],
        ['9:00 AM', 'Discord launch event begins', 'Founder', '[ ]'],
        ['10:00 AM', 'Press release distributed via PR wire', 'Founder', '[ ]'],
        ['12:00 PM', 'Influencer content goes live (coordinated)', 'Partners', '[ ]'],
        ['3:00 PM', 'TikTok launch video posted', 'Founder', '[ ]'],
        ['6:00 PM', 'Twitter Spaces: "Building Predictly in 30 Days"', 'Founder', '[ ]'],
        ['9:00 PM', 'End-of-day metrics review + community engagement', 'Founder', '[ ]'],
    ],
    [0.10, 0.50, 0.15, 0.10]
))
story.append(Spacer(1, 12))

story.append(h2('2.2 Social Media Blast Scripts'))
story.append(h3('Twitter/X Launch Thread (First 5 of 25 tweets)'))
story.append(Spacer(1, 4))

tweets = [
    ('1/25', 'PREDICTLY IS LIVE.', 'The free prediction market where you can win real rewards. 12 markets. 8 categories. 0 fees on practice trades. This is the future of forecasting. Let me tell you how we got here.'),
    ('2/25', 'Most prediction markets require crypto. Not Predictly.', 'Our dual-currency system lets you practice with Gold Coins (free, unlimited) and compete with Sweeps Coins (redeemable for cash prizes). No wallet needed.'),
    ('3/25', '12 markets at launch:', 'Presidential Election, Bitcoin $150K, Super Bowl Winner, AGI by 2028, Fed Rate Cut, Oscar Best Picture, Mars Mission 2030, and 5 more. Every category, every interest.'),
    ('4/25', '6 AI agents power Predictly:', 'Scout (market analyst), Oddsmaker (odds engine), Sentry (risk guard), Oracle (resolution engine), Chronicler (historian), Prophet (predictor). They work 24/7 so you trade smarter.'),
    ('5/25', 'Legal in 48+ US states.', 'Our sweepstakes model means no crypto gambling regulations. Play from your phone. Win from your couch. Predictly is prediction markets for everyone.'),
]
for num, title, content in tweets:
    story.append(Paragraph('<b>Tweet %s:</b> <i>%s</i> %s' % (num, title, content), s_body_indent))
    story.append(Spacer(1, 3))

story.append(Spacer(1, 6))
story.append(h3('Reddit Launch Post (r/PredictionMarkets)'))
story.append(body('<b>Title:</b> "After 30 days of solo building, I launched a free prediction market platform - Predictly"'))
story.append(body('<b>Body:</b> "Hey r/PredictionMarkets - I just launched Predictly, a dual-currency prediction market that is free to play and legal in most US states. No crypto needed. We have 12 markets covering politics, crypto, sports, tech, economics, pop culture, science, and world events. Gold Coins are free and unlimited for practice. Sweeps Coins can be redeemed for real rewards. 6 AI agents (Scout, Oddsmaker, Sentry, Oracle, Chronicler, Prophet) provide real-time market intelligence. Would love your feedback and first trades!"'))
story.append(Spacer(1, 6))
story.append(h3('TikTok Launch Script'))
story.append(body('<b>Hook (0-3s):</b> "What if you could predict the future and get paid for being right?"'))
story.append(body('<b>Body (3-12s):</b> "This is Predictly. 12 markets. Politics, crypto, sports, tech. Practice for free with Gold Coins. Win real rewards with Sweeps Coins. No crypto wallet needed. Legal in most states."'))
story.append(body('<b>CTA (12-15s):</b> "Link in bio. Your first 1,000 Gold Coins are free."'))
story.append(Spacer(1, 12))

story.append(h2('2.3 Email Campaign Templates'))
story.append(h3('Welcome Email'))
story.append(body('<b>Subject:</b> Welcome to Predictly - Your 1,000 Gold Coins Are Waiting'))
story.append(body('<b>Body:</b> "Hey [Name], welcome to Predictly! You just joined the smartest community of predictors on the internet. Here is what happens next: (1) Your 1,000 free Gold Coins are already in your account. Start trading on 12 live markets now. (2) Check out our AI agents - Scout analyzes markets, Oddsmaker sets the lines, and Prophet makes predictions. (3) Want real rewards? Switch to Sweeps Coins anytime. Redeemable for cash prizes. Your first market is waiting. Go predict."'))
story.append(Spacer(1, 6))
story.append(h3('First Trade Encouragement (Day 2)'))
story.append(body('<b>Subject:</b> You haven\'t made your first prediction yet...'))
story.append(body('<b>Body:</b> "Hey [Name], your 1,000 Gold Coins are sitting idle and that is a waste of good predictions. Here are 3 markets trending right now: [Market 1], [Market 2], [Market 3]. The top predictor this week won 50,000 GC. Could be you next week. Make your first trade now - it takes 10 seconds."'))
story.append(Spacer(1, 6))
story.append(h3('Onboarding Sequence'))
story.append(make_table(
    ['Email', 'Day', 'Subject', 'Goal'],
    [
        ['Welcome', '0', 'Your 1,000 Gold Coins Are Waiting', 'Activate account'],
        ['First Trade', '2', 'You haven\'t made your first prediction yet...', 'First trade'],
        ['Market Highlights', '4', 'These 3 markets are heating up', 'Engagement'],
        ['SC Introduction', '7', 'Ready to play for real? Meet Sweeps Coins', 'SC conversion'],
        ['Weekly Digest', '14+', 'Your Weekly Predictly Digest', 'Retention'],
    ],
    [0.15, 0.08, 0.45, 0.25]
))
story.append(Spacer(1, 12))

story.append(h2('2.4 Press Release Draft'))
story.append(body('<b>FOR IMMEDIATE RELEASE</b>'))
story.append(body('<b>Predictly Launches Free Prediction Market Platform with Dual-Currency System and AI-Powered Market Intelligence</b>'))
story.append(Spacer(1, 3))
story.append(body('June 7, 2026 - Predictly, the first dual-currency prediction market platform, today announced its public launch. Predictly combines free-to-play Gold Coins with redeemable Sweeps Coins, making prediction markets accessible to everyone in the US without requiring cryptocurrency wallets or accounts.'))
story.append(body('The platform launches with 12 markets spanning politics, cryptocurrency, sports, technology, economics, pop culture, science, and world events. Six AI agents - Scout, Oddsmaker, Sentry, Oracle, Chronicler, and Prophet - provide real-time market intelligence, automated odds-making, and portfolio risk management.'))
story.append(body('"Prediction markets should be for everyone, not just crypto enthusiasts," said the founder. "Predictly makes forecasting accessible, legal, and rewarding. Our sweepstakes model works in 48+ states, and our AI agents give every user an analytical edge."'))
story.append(body('Predictly is available immediately at predictly.app. New users receive 1,000 free Gold Coins to start trading.'))
story.append(Spacer(1, 12))

story.append(h2('2.5 ProductHunt Launch Strategy'))
story.append(bullet('<b>Timing:</b> Launch at 12:01 AM PT on launch day for maximum visibility throughout the day.'))
story.append(bullet('<b>Tagline:</b> "Free prediction markets with AI agents. Predict the future, win for real."'))
story.append(bullet('<b>Maker comment:</b> Write a detailed story about building Predictly solo in 30 days. Include 3 screenshots and a 60-second demo video.'))
story.append(bullet('<b>First-hour push:</b> Get 10 upvotes in the first hour from your email list and Discord community.'))
story.append(bullet('<b>Engagement:</b> Reply to every comment within 5 minutes. Offer free SC to commenters.'))
story.append(bullet('<b>Cross-promotion:</b> Post PH link on Twitter, Reddit, and Discord with "We just launched on ProductHunt!"'))
story.append(Spacer(1, 12))

story.append(h2('2.6 Reddit AMA Plan'))
story.append(body('<b>Date:</b> Monday, June 9 (2 days post-launch, captures Monday traffic)'))
story.append(body('<b>Subreddit:</b> r/IAmA with cross-post to r/PredictionMarkets, r/Entrepreneur, r/SideProject'))
story.append(body('<b>Title:</b> "I built a legal prediction market platform as a solo founder in 30 days. AMA about prediction markets, sweepstakes gaming, or solo startups."'))
story.append(body('<b>Preparation:</b> Write answers to 20 expected questions beforehand. Have screenshots, market cards, and demo GIFs ready.'))
story.append(Spacer(1, 12))

story.append(h2('2.7 Twitter Spaces / Discord Event Plan'))
story.append(body('<b>Twitter Spaces:</b> "Building Predictly in 30 Days" - Launch day 6 PM ET, 45 minutes. Solo founder shares the journey, takes live questions. Invite 2-3 crypto/prediction market commentators as guests.'))
story.append(body('<b>Discord Launch Party:</b> Launch day 9 AM - 9 PM ET. Scheduled events every 2 hours: market walkthroughs, AMA with founder, trading competitions, SC giveaways. Create #launch-party channel with restricted access for email subscribers.'))
story.append(Spacer(1, 18))


# ══════════════════════════════════════════════════════════
# SECTION 3: POST-LAUNCH GROWTH (MONTH 2+)
# ══════════════════════════════════════════════════════════
story.extend(add_major_section('3. Post-Launch Growth (Month 2+)'))

story.append(h2('3.1 User Retention Strategies'))
story.append(body('Retention is the most important metric for a bootstrap platform. A user who stays is worth 10x a user who signs up and leaves.'))
story.append(Spacer(1, 4))
story.append(make_table(
    ['Strategy', 'Implementation', 'Frequency', 'Expected Impact'],
    [
        ['Daily login bonus', '100 GC per day, streak multiplier (7-day = 500 GC bonus)', 'Daily', '+40% DAU retention'],
        ['Weekly market drops', 'New markets every Tuesday + Thursday to maintain freshness', '2x/week', '+25% weekly return rate'],
        ['Leaderboard gamification', 'Daily/weekly/all-time GC and SC leaderboards with badges', 'Real-time', '+15% session frequency'],
        ['AI agent insights push', 'Scout sends "hot market" notifications via email/push', '3x/week', '+20% re-engagement'],
        ['Market resolution celebrations', 'Confetti animation + shareable results card when market resolves', 'Per resolution', '+30% social sharing'],
        ['Loss mitigation', 'Sentry suggests hedging positions; 10% GC back on losses', 'Real-time', '+20% continued trading after loss'],
    ],
    [0.20, 0.40, 0.13, 0.22]
))
story.append(Spacer(1, 12))

story.append(h2('3.2 Referral Program Optimization'))
story.append(body('The referral program is the primary growth engine for a bootstrap budget. Design for virality.'))
story.append(Spacer(1, 4))
story.append(bullet('<b>Referrer reward:</b> 500 GC + 5 SC per successful referral (verified email + first trade)'))
story.append(bullet('<b>Referee reward:</b> 1,500 GC + 2 SC on signup via referral link'))
story.append(bullet('<b>Milestone bonuses:</b> 5 referrals = 25 SC; 25 referrals = 100 SC; 100 referrals = 500 SC'))
story.append(bullet('<b>Shareable assets:</b> Auto-generated "I predicted [X] on Predictly" share cards with referral link embedded'))
story.append(bullet('<b>Double reward days:</b> Every Friday, referral rewards are doubled to drive weekend signups'))
story.append(Spacer(1, 12))

story.append(h2('3.3 Community Building'))
story.append(bullet('<b>Discord structure:</b> #general, #market-discussion, #predictions, #market-suggestions, #bug-reports, #wins, #founder-updates, #vip-predictors (SC traders only)'))
story.append(bullet('<b>Weekly events:</b> "Market Mondays" (new markets), "Wisdom Wednesdays" (AI agent insights), "Showdown Saturdays" (trading competitions)'))
story.append(bullet('<b>Community market creation:</b> Let users propose and vote on new markets. Top-voted markets get created weekly.'))
story.append(bullet('<b>Ambassador program:</b> Top 20 community members get "Predictly Ambassador" role, exclusive SC, and early access to features.'))
story.append(Spacer(1, 12))

story.append(h2('3.4 Content Marketing Calendar (Month 2+)'))
story.append(make_table(
    ['Week', 'Blog Post', 'Social Content', 'Email', 'Video'],
    [
        ['Week 5', '"How to Read Prediction Market Odds"', 'Daily market highlights', 'Weekly digest', 'Odds explainer (TikTok)'],
        ['Week 6', '"The Science Behind AI-Powered Predictions"', 'Agent spotlight: Scout', 'SC conversion push', 'Scout deep dive (YouTube)'],
        ['Week 7', '"5 Markets That Made Predictors Rich"', 'User success stories', 'Referral program push', 'Top 5 predictions (TikTok)'],
        ['Week 8', '"Prediction Markets vs Sports Betting: Key Differences"', 'Legal education content', 'Monthly recap', 'Legal explainer (YouTube)'],
    ],
    [0.08, 0.30, 0.22, 0.18, 0.18]
))
story.append(Spacer(1, 12))

story.append(h2('3.5 Paid Advertising Strategy (When Budget Allows)'))
story.append(body('Do NOT spend on paid ads until organic channels prove product-market fit. Minimum threshold: 1,000 DAU and 30%+ D7 retention.'))
story.append(Spacer(1, 4))
story.append(make_table(
    ['Channel', 'Budget', 'Targeting', 'Expected CPA', 'When to Start'],
    [
        ['Twitter/X Ads', '$500/mo', 'Prediction market keywords, crypto, politics', '$2-5/signup', 'Month 3'],
        ['Reddit Ads', '$300/mo', 'r/PredictionMarkets, r/CryptoCurrency, r/sportsbook', '$1-3/signup', 'Month 3'],
        ['Google Ads', '$500/mo', '"prediction market" + related keywords', '$3-7/signup', 'Month 4'],
        ['TikTok Ads', '$200/mo', '18-34, interest: finance, crypto, sports', '$0.50-2/signup', 'Month 4'],
        ['Podcast sponsorship', '$300/episode', 'Crypto/politics podcasts, 5K+ listeners', '$2-4/signup', 'Month 5'],
    ],
    [0.15, 0.12, 0.35, 0.15, 0.12]
))
story.append(Spacer(1, 18))


# ══════════════════════════════════════════════════════════
# SECTION 4: MARKET STAGGERING PLAN
# ══════════════════════════════════════════════════════════
story.extend(add_major_section('4. Market Staggering Plan'))

story.append(h2('4.1 Staggering Strategy'))
story.append(body('Resolving all markets simultaneously would create a cash flow crisis. Markets must be staggered to ensure the platform always has sufficient liquidity to pay winners while retaining a spread for operations. The key principle: <b>short-cycle markets resolve first to build trust and demonstrate payouts; long-cycle markets maintain engagement and deferred liability.</b>'))
story.append(Spacer(1, 6))

story.append(make_table(
    ['Priority', 'Market', 'Category', 'Resolution Timeline', 'Pool Size (SC)', 'Strategy'],
    [
        ['1 - First', 'Super Bowl LVII Winner', 'Sports', 'Feb 2027', '500 SC', 'Quick trust-building payout'],
        ['2 - First', 'Oscar Best Picture 2027', 'Pop Culture', 'Mar 2027', '300 SC', 'Low-liability, high-engagement'],
        ['3 - Early', 'Bitcoin Hits $150K', 'Crypto', 'Dec 2026', '1,000 SC', 'Medium-term, high volume'],
        ['4 - Early', 'Fed Rate Below 4%', 'Economics', 'Dec 2026', '400 SC', 'Data-driven, predictable'],
        ['5 - Mid', 'AI Passes Bar Exam v2', 'Tech', 'Jun 2027', '600 SC', 'Medium-term, high interest'],
        ['6 - Mid', 'Next UK PM', 'World', '2027', '350 SC', 'Medium-term, moderate pool'],
        ['7 - Mid', 'Mars Mission 2030 Launch', 'Science', '2030', '200 SC', 'Long-tail engagement driver'],
        ['8 - Late', '2028 Presidential Winner', 'Politics', 'Nov 2028', '2,000 SC', 'Largest pool, latest resolution'],
    ],
    [0.08, 0.22, 0.10, 0.12, 0.10, 0.30]
))
story.append(Spacer(1, 8))

story.append(h2('4.2 Pool Management Timeline'))
story.append(body('<b>Week 1-2 (Launch):</b> All 12 markets open for trading. SC pools seeded with initial allocations. Focus on GC trading volume to build activity.'))
story.append(body('<b>Week 3-6:</b> Monitor pool balances. If any market SC pool exceeds 500 SC, implement Sentry risk alerts and adjust odds. Begin collecting platform spread (0.5-2%).'))
story.append(body('<b>Month 2-3:</b> First market resolutions (short-cycle). Demonstrate payout reliability. Use resolved market results in marketing ("User won 500 SC on Oscar prediction").'))
story.append(body('<b>Month 4-6:</b> Introduce "Boosted Markets" (sponsored). Revenue from sponsors offsets pool liability. Add 2-4 new markets monthly.'))
story.append(body('<b>Month 7+:</b> Steady state. Market resolution cadence of 1-2 per month. Withdrawal processing fees (0.5-5%) generate sustainable revenue. Insurance/hedging premiums add secondary revenue.'))
story.append(Spacer(1, 18))


# ══════════════════════════════════════════════════════════
# SECTION 5: MOCK DATA STRATEGY
# ══════════════════════════════════════════════════════════
story.extend(add_major_section('5. Mock Data Strategy'))

story.append(h2('5.1 Launch with Mock Data: Yes'))
story.append(quote('A prediction market with zero activity is a ghost town. Mock data is not deception - it is a seeded garden waiting for real gardeners.'))
story.append(Spacer(1, 4))
story.append(body('<b>Recommendation: Launch with mock data</b> - specifically, simulated trading volume and positions to make markets appear active from Day 1. This is standard practice in marketplace launches (Airbnb, Uber, etc.).'))
story.append(Spacer(1, 6))

story.append(make_table(
    ['Mock Data Type', 'Implementation', 'Transparency', 'Transition Trigger'],
    [
        ['Simulated GC trades', 'Bot accounts place 50-100 trades/day across all markets', 'Disclosed in ToS: "Platform includes simulated activity"', 'Remove when organic trades > 200/day'],
        ['Pre-seeded odds', 'Oddsmaker AI sets realistic opening lines based on prediction market data', 'Fully disclosed - AI-set odds are a feature', 'N/A - always AI-powered'],
        ['Mock leaderboard entries', 'Generate 20-30 fictional user names with GC balances', 'NOT disclosed initially (ethical gray area)', 'Replace with real users after 100 real traders'],
        ['Market volume indicators', 'Display "X trades today" including simulated trades', 'Disclosed in FAQ: "Volume includes platform activity"', 'Remove when organic volume > 500/day'],
        ['Chat/discussion activity', 'Bot-generated market commentary in Discord', 'Disclosed: "AI assistant market commentary"', 'Replace with real community by Month 2'],
    ],
    [0.18, 0.32, 0.25, 0.22]
))
story.append(Spacer(1, 8))

story.append(h2('5.2 Transition Plan'))
story.append(body('<b>Phase 1 (Weeks 1-2):</b> 70% mock / 30% real. Mock trades dominate volume. Focus on making the platform look and feel alive.'))
story.append(body('<b>Phase 2 (Weeks 3-4):</b> 50% mock / 50% real. As real users join, gradually reduce mock trade frequency. Target: 200 real trades/day.'))
story.append(body('<b>Phase 3 (Month 2):</b> 20% mock / 80% real. Mock trades only in low-activity markets. High-traffic markets run on organic volume.'))
story.append(body('<b>Phase 4 (Month 3+):</b> 0% mock. All simulated activity removed. AI agents (Scout, Oddsmaker) remain as features, not mock activity.'))
story.append(Spacer(1, 6))

story.append(h2('5.3 A/B Testing Approach'))
story.append(bullet('<b>Test 1 (Week 1-2):</b> Mock volume display ON vs. OFF for new users. Measure: first-trade rate, session duration.'))
story.append(bullet('<b>Test 2 (Week 3-4):</b> Welcome bonus: 1,000 GC vs. 1,000 GC + 2 SC. Measure: SC conversion rate at Day 7.'))
story.append(bullet('<b>Test 3 (Month 2):</b> Market resolution speed: instant vs. 24h delay. Measure: user satisfaction, trading volume on next market.'))
story.append(bullet('<b>Test 4 (Month 2):</b> AI agent visibility: proactive notifications vs. on-demand. Measure: agent interaction rate, trade frequency.'))
story.append(bullet('<b>Test 5 (Month 3):</b> Referral reward structure: flat vs. milestone-based. Measure: referral conversion, viral coefficient.'))
story.append(Spacer(1, 18))


# ══════════════════════════════════════════════════════════
# SECTION 6: EMAIL TEMPLATES
# ══════════════════════════════════════════════════════════
story.extend(add_major_section('6. Email Templates'))

story.append(h2('6.1 Welcome Email'))
story.append(body('<b>Subject:</b> Welcome to Predictly - Your 1,000 Gold Coins Are Waiting'))
story.append(body('<b>Preview:</b> Start predicting the future in 30 seconds.'))
story.append(Spacer(1, 3))
story.append(body('Hey [First Name],'))
story.append(body('Welcome to Predictly - the free prediction market where being right pays off.'))
story.append(body('Here is what is waiting for you:'))
story.append(bullet('<b>1,000 Gold Coins</b> - already in your account. Start trading now.'))
story.append(bullet('<b>12 live markets</b> - politics, crypto, sports, tech, and more.'))
story.append(bullet('<b>6 AI agents</b> - Scout, Oddsmaker, Sentry, Oracle, Chronicler, and Prophet are ready to help you trade smarter.'))
story.append(Spacer(1, 3))
story.append(body('Your first market is waiting. Make your first prediction now.'))
story.append(body('[CTA Button: Start Trading Now]'))
story.append(body('To real predictions,'))
story.append(body('The Predictly Team'))
story.append(Spacer(1, 12))

story.append(h2('6.2 First Trade Encouragement'))
story.append(body('<b>Subject:</b> Your 1,000 Gold Coins are sitting idle...'))
story.append(body('<b>Preview:</b> 3 trending markets you should check out right now.'))
story.append(Spacer(1, 3))
story.append(body('Hey [First Name],'))
story.append(body('You signed up for Predictly [X] days ago but haven\'t made your first prediction yet. That is like buying a ticket to the Super Bowl and not walking through the gate.'))
story.append(body('Here are 3 markets trending right now:'))
story.append(bullet('[Market 1 Name] - [Current Odds] - [Volume] trades today'))
story.append(bullet('[Market 2 Name] - [Current Odds] - [Volume] trades today'))
story.append(bullet('[Market 3 Name] - [Current Odds] - [Volume] trades today'))
story.append(Spacer(1, 3))
story.append(body('The top predictor this week won 50,000 GC. Could be you next week.'))
story.append(body('[CTA Button: Make Your First Prediction]'))
story.append(Spacer(1, 12))

story.append(h2('6.3 Weekly Market Digest'))
story.append(body('<b>Subject:</b> Your Weekly Predictly Digest - [Week Date]'))
story.append(body('<b>Preview:</b> [Top market headline] + your weekly performance.'))
story.append(Spacer(1, 3))
story.append(body('Hey [First Name], here is your Predictly week in review:'))
story.append(body('<b>Your Stats:</b> [X] predictions made | [X]% accuracy | [X] GC earned'))
story.append(body('<b>Hot Markets This Week:</b>'))
story.append(bullet('[Market 1]: [Movement summary] - [Why it moved]'))
story.append(bullet('[Market 2]: [Movement summary] - [Why it moved]'))
story.append(bullet('[Market 3]: [Movement summary] - [Why it moved]'))
story.append(body('<b>Scout Says:</b> "[AI-generated insight about upcoming market movement]"'))
story.append(body('<b>New Markets:</b> [List of new markets added this week]'))
story.append(body('[CTA Button: Trade This Week\'s Markets]'))
story.append(Spacer(1, 12))

story.append(h2('6.4 Referral Invitation'))
story.append(body('<b>Subject:</b> Give your friends 1,500 Gold Coins (and earn 500 for yourself)'))
story.append(body('<b>Preview:</b> Sharing is caring. And rewarding.'))
story.append(Spacer(1, 3))
story.append(body('Hey [First Name],'))
story.append(body('Know someone who always thinks they are right? Put them to the test on Predictly.'))
story.append(body('Share your unique referral link and both of you win:'))
story.append(bullet('<b>They get:</b> 1,500 GC + 2 SC on signup'))
story.append(bullet('<b>You get:</b> 500 GC + 5 SC per referral'))
story.append(bullet('<b>Milestone bonus:</b> Refer 5 friends = 25 SC bonus'))
story.append(body('Your referral link: [UNIQUE_REFERRAL_LINK]'))
story.append(body('[CTA Button: Share Predictly Now]'))
story.append(Spacer(1, 12))

story.append(h2('6.5 Win Celebration'))
story.append(body('<b>Subject:</b> You won! [Market Name] just resolved in your favor.'))
story.append(body('<b>Preview:</b> [X] Sweeps Coins just hit your account.'))
story.append(Spacer(1, 3))
story.append(body('Congratulations, [First Name]!'))
story.append(body('You predicted [Market Outcome] and the market just resolved. You earned [X] SC!'))
story.append(body('Your prediction accuracy is now [X]%. You are in the top [X]% of Predictly traders.'))
story.append(body('Share your win and let everyone know you called it.'))
story.append(body('[CTA Button: Share Your Win] | [CTA Button: Trade Next Market]'))
story.append(Spacer(1, 18))


# ══════════════════════════════════════════════════════════
# SECTION 7: SOCIAL MEDIA SCRIPTS
# ══════════════════════════════════════════════════════════
story.extend(add_major_section('7. Social Media Scripts'))

story.append(h2('7.1 Twitter/X Posts (10 Scripts)'))
story.append(Spacer(1, 4))

twitter_posts = [
    ('Post 1 - Launch Day', 'PREDICTLY IS LIVE. 12 markets. 8 categories. Free to play, real to win. No crypto needed. Legal in 48+ states. Your first 1,000 Gold Coins are waiting. #Predictly #PredictionMarket #LaunchDay'),
    ('Post 2 - Dual Currency', 'Gold Coins = practice for free. Sweeps Coins = win for real. One platform, two ways to play. That is the Predictly difference. #Predictly #DualCurrency #PredictionMarket'),
    ('Post 3 - AI Agents', '6 AI agents. 1 mission: help you trade smarter. Scout analyzes. Oddsmaker sets lines. Sentry protects. Oracle resolves. Chronicler records. Prophet predicts. #Predictly #AI #PredictionMarket'),
    ('Post 4 - Legal Angle', 'Legal prediction markets exist. Predictly uses the sweepstakes model - valid in 48+ US states. No crypto wallet needed. Just your brain and your gut. #Predictly #LegalPredictionMarket'),
    ('Post 5 - Market Highlight', '"Will Bitcoin hit $150K by Dec 2026?" That is live on Predictly right now. Current odds: 23% YES. What do you think? #Predictly #Bitcoin #Crypto'),
    ('Post 6 - Social Proof', 'Top predictor this week: @username with 94% accuracy and 47,000 GC earned. Can you beat that? Join Predictly and find out. #Predictly #PredictionMarket'),
    ('Post 7 - Founder Story', 'I built Predictly in 30 days as a solo founder. No funding. No team. Just a vision: prediction markets for everyone. Here is the full story [THREAD] #BuildInPublic #SoloFounder'),
    ('Post 8 - Quick Tip', 'Predictly tip: Use Scout\'s AI analysis before making any trade. It aggregates data from 50+ sources and gives you a confidence score. Free for all users. #Predictly #AITrading'),
    ('Post 9 - Engagement Bait', 'Poll: Which market are you trading first on Predictly? Politics / Crypto / Sports / Tech. Reply with your pick and why. Best answer gets 100 GC. #Predictly'),
    ('Post 10 - Milestone', '1,000 users in our first week. 12,000 predictions made. 3 markets already trending. This is just the beginning. Thank you, Predictly community. #Predictly #Milestone'),
]

for title, content in twitter_posts:
    story.append(Paragraph('<b>%s</b>' % title, s_h3))
    story.append(Paragraph(content, s_body_indent))
    story.append(Spacer(1, 4))

story.append(Spacer(1, 8))
story.append(h2('7.2 Reddit Posts (5 Scripts)'))
story.append(Spacer(1, 4))

reddit_posts = [
    ('r/PredictionMarkets', 'After 30 days of solo building, I launched a free prediction market platform - Predictly', 'I just launched Predictly, a dual-currency prediction market that is free to play and legal in most US states. 12 markets at launch, 6 AI agents, no crypto needed. Would love feedback from this community.'),
    ('r/CryptoCurrency', 'Prediction markets without crypto: Is that even possible?', 'Predictly just launched a sweepstakes-based prediction market that does not require a crypto wallet. Gold Coins are free and unlimited. Sweeps Coins are redeemable. Is this the future of prediction markets for mainstream users?'),
    ('r/Entrepreneur', 'I built a prediction market platform as a solo founder in 30 days. Here is what I learned.', '30 days, 0 funding, 1 founder. I built Predictly from scratch using Next.js, Supabase, and free-tier infrastructure. Sharing the full build journey, mistakes, and what I would do differently.'),
    ('r/sportsbook', 'What if you could predict more than just game outcomes?', 'Predictly lets you trade predictions on sports AND politics, crypto, tech, science - all in one place. Free to practice with Gold Coins. Real rewards with Sweeps Coins. Curious what this community thinks.'),
    ('r/artificial', 'I built 6 AI agents that analyze prediction markets in real-time', 'Each agent has a specific role: market analysis, odds-making, risk management, resolution, historical analysis, and prediction. All built on free AI APIs. Sharing the architecture if anyone is interested.'),
]

for subreddit, title, content in reddit_posts:
    story.append(Paragraph('<b>%s</b>' % subreddit, s_h3))
    story.append(Paragraph('<b>Title:</b> %s' % title, s_body_indent))
    story.append(Paragraph('<b>Body:</b> %s' % content, s_body_indent))
    story.append(Spacer(1, 4))

story.append(Spacer(1, 8))
story.append(h2('7.3 TikTok Video Concepts (3 Scripts)'))
story.append(Spacer(1, 4))

story.append(Paragraph('<b>Concept 1: "What if you could predict the future?"</b>', s_h3))
story.append(body('Visual: Quick cuts of news headlines (elections, crypto prices, sports scores) with a dramatic zoom on each. Cut to Predictly app screen showing the same events as markets. Text overlay: "You called it. Now cash in." CTA: "Link in bio for free Gold Coins."'))
story.append(Spacer(1, 4))

story.append(Paragraph('<b>Concept 2: "Gold Coins vs Sweeps Coins Explained"</b>', s_h3))
story.append(body('Visual: Split screen. Left: Gold Coins (practice, unlimited, free) with animated coins stacking up. Right: Sweeps Coins (real rewards, redeemable, limited) with cash animation. Center: Predictly logo. Text: "Two currencies. One platform. Zero limits." CTA: "Start free today."'))
story.append(Spacer(1, 4))

story.append(Paragraph('<b>Concept 3: "6 AI Agents That Trade While You Sleep"</b>', s_h3))
story.append(body('Visual: Animated characters for each AI agent (Scout with binoculars, Oddsmaker with calculator, Sentry with shield, etc.) doing their jobs while the user sleeps. Wake up to notifications: "Scout found a hot market" + "Sentry protected your position." CTA: "Meet your AI team."'))
story.append(Spacer(1, 12))

story.append(h2('7.4 Discord Community Messages (5 Scripts)'))
story.append(Spacer(1, 4))

discord_msgs = [
    ('#announcements - Launch Day', '@everyone PREDICTLY IS LIVE! 12 markets, 6 AI agents, and 1,000 free Gold Coins waiting for you. Head to predictly.app and make your first prediction NOW. The first 100 traders get a bonus 5 SC. Go go go!'),
    ('#market-discussion - Daily Highlight', 'Today\'s hot market: [Market Name]. Current odds: [X]% YES. Scout\'s confidence: [Y]%. What side are you on? Drop your analysis below and let\'s debate.'),
    ('#wins - Celebration', 'HUGE congrats to @[Username] who just won [X] SC on [Market Name]! That is how you call it. Share your win screenshots below and let\'s celebrate!'),
    ('#market-suggestions - Community', 'What market do YOU want to see next? Reply with your idea and the most upvoted suggestion becomes our next market. Last week\'s winner: [Previous Market]. Your turn!'),
    ('#founder-updates - Weekly', 'Week [X] update: [Y] active traders, [Z] predictions made, [W] new markets added. We also just shipped [Feature]. What do you want next? Drop feedback in #suggestions.'),
]

for channel, message in discord_msgs:
    story.append(Paragraph('<b>%s</b>' % channel, s_h3))
    story.append(Paragraph(message, s_body_indent))
    story.append(Spacer(1, 4))

story.append(Spacer(1, 18))


# ══════════════════════════════════════════════════════════
# SECTION 8: TIMELINE & MILESTONES
# ══════════════════════════════════════════════════════════
story.extend(add_major_section('8. Timeline and Milestones'))

story.append(h2('8.1 Week-by-Week Breakdown'))
story.append(Spacer(1, 4))

story.append(make_table(
    ['Week', 'Dates', 'Focus', 'Key Deliverables', 'Success Metric'],
    [
        ['Week 1', 'May 25-31', 'Brand + Social Setup', 'Social accounts, landing page, email capture, brand assets', '100 email signups'],
        ['Week 2', 'Jun 1-7', 'Content + Pre-Launch', 'Blog posts, SEO foundation, influencer outreach, PH listing', '300 email signups'],
        ['Week 3', 'Jun 8-14', 'LAUNCH WEEK', 'Full launch, PH, Reddit AMA, Twitter Spaces, Discord party', '500 signups, 100 DAU'],
        ['Week 4', 'Jun 15-21', 'Post-Launch Optimization', 'Bug fixes, onboarding optimization, first market resolution', '200 DAU, 50% D7 retention'],
        ['Week 5', 'Jun 22-28', 'Growth Experiments', 'A/B testing, referral program push, content marketing', '500 DAU, 30% D14 retention'],
        ['Week 6', 'Jun 29-Jul 5', 'Community Building', 'Ambassador program, Discord events, market voting', '750 DAU, 50 SC traders'],
        ['Week 7', 'Jul 6-12', 'Revenue Activation', 'Withdrawal speed charges, boosted markets pilot', 'First $100 revenue'],
        ['Week 8', 'Jul 13-19', 'Scale + Iterate', 'New market categories, MaaS widget beta, Playbooks alpha', '1,000 DAU, $500 MRR'],
    ],
    [0.07, 0.12, 0.15, 0.35, 0.22]
))
story.append(Spacer(1, 12))

story.append(h2('8.2 Key Metrics to Track'))
story.append(make_table(
    ['Metric', 'Definition', 'Target (Week 4)', 'Target (Month 3)', 'Tracking Tool'],
    [
        ['Signups', 'Total registered users', '1,000', '5,000', 'Supabase Analytics'],
        ['DAU', 'Daily active users (traded or logged in)', '200', '1,000', 'Custom dashboard'],
        ['D7 Retention', '% returning after 7 days', '30%', '40%', 'Supabase + custom'],
        ['First Trade Rate', '% who make first trade within 24h', '50%', '65%', 'Event tracking'],
        ['GC Trade Volume', 'Total GC traded per day', '10,000', '50,000', 'Platform analytics'],
        ['SC Conversion', '% GC users who try SC', '10%', '20%', 'Funnel tracking'],
        ['Referral Rate', '% who refer another user', '5%', '15%', 'Referral tracking'],
        ['NPS', 'Net Promoter Score', '40+', '60+', 'In-app survey'],
        ['Revenue', 'Total platform revenue', '$0 (pre-rev)', '$500 MRR', 'Stripe/dashboard'],
        ['Market Resolution', 'Markets resolved successfully', '1', '5+', 'Oracle agent'],
    ],
    [0.14, 0.30, 0.14, 0.14, 0.18]
))
story.append(Spacer(1, 12))

story.append(h2('8.3 Success Criteria'))
story.append(body('<b>Minimum Viable Launch (Week 4):</b>'))
story.append(bullet('1,000 signups'))
story.append(bullet('200 DAU'))
story.append(bullet('30%+ D7 retention'))
story.append(bullet('At least 1 market resolved'))
story.append(bullet('NPS 30+'))
story.append(Spacer(1, 4))
story.append(body('<b>Sustainable Growth (Month 3):</b>'))
story.append(bullet('5,000 signups'))
story.append(bullet('1,000 DAU'))
story.append(bullet('40%+ D7 retention'))
story.append(bullet('$500 MRR from at least 2 revenue streams'))
story.append(bullet('10+ SC withdrawals processed'))
story.append(Spacer(1, 4))
story.append(body('<b>Product-Market Fit Signals:</b>'))
story.append(bullet('Organic word-of-mouth accounts for >30% of signups'))
story.append(bullet('Users create content about Predictly without prompting'))
story.append(bullet('D7 retention exceeds 40% consistently'))
story.append(bullet('Referral viral coefficient > 0.5'))
story.append(Spacer(1, 18))


# ══════════════════════════════════════════════════════════
# SECTION 9: CLINE.BOT ASSESSMENT
# ══════════════════════════════════════════════════════════
story.extend(add_major_section('9. Cline.bot Assessment'))

story.append(h2('9.1 Recommendation: Do NOT Integrate Cline SDK'))
story.append(body('After thorough evaluation, <b>Cline SDK should NOT be integrated into the public Predictly application</b>. Here is the detailed analysis:'))
story.append(Spacer(1, 6))

story.append(make_table(
    ['Factor', 'Cline SDK', 'Assessment'],
    [
        ['Target User', 'Developers (VS Code extension)', 'Mismatch: Predictly users are traders/predictors, not developers'],
        ['Core Value', 'AI coding assistant, MCP tool integration', 'Irrelevant: Users do not write code on the platform'],
        ['Integration Complexity', 'Requires VS Code extension, MCP server setup', 'Overkill: Adds dependency with zero user-facing benefit'],
        ['MCP Ecosystem', 'Rich tool ecosystem for developer workflows', 'Useful internally for dev team, not for end users'],
        ['Cost/Benefit', 'High integration cost, zero user value', 'Negative ROI for public-facing integration'],
        ['Security Risk', 'Exposes developer tooling to end users', 'Unnecessary attack surface'],
    ],
    [0.15, 0.35, 0.43]
))
story.append(Spacer(1, 8))

story.append(h2('9.2 Internal Use Case: Acceptable'))
story.append(body('The Cline/MCP ecosystem <b>could be valuable for the internal development team</b>:'))
story.append(bullet('Use MCP servers internally to connect AI agents to development tools (GitHub, databases, monitoring)'))
story.append(bullet('Use Cline as a development accelerator for building new features and debugging'))
story.append(bullet('Explore MCP protocol for future agent-to-agent communication within Predictly'))
story.append(Spacer(1, 8))

story.append(h2('9.3 Alternative: z-ai-web-dev-sdk AI Employee System'))
story.append(body('Instead of Cline, use the <b>AI employee system built on z-ai-web-dev-sdk</b> for all user-facing AI functionality:'))
story.append(Spacer(1, 4))
story.append(make_table(
    ['AI Agent', 'Role', 'z-ai-web-dev-sdk Usage', 'User-Facing Feature'],
    [
        ['Scout', 'Market Analyst', 'Analyzes market data, news, social sentiment', '"Scout Says" insights, hot market alerts'],
        ['Oddsmaker', 'Odds Engine', 'Generates probability estimates from data', 'Real-time odds, line movements'],
        ['Sentry', 'Risk Manager', 'Monitors portfolios, detects anomalies', 'Risk alerts, hedging suggestions'],
        ['Oracle', 'Resolution Engine', 'Determines market outcomes from verified data', 'Transparent market resolution'],
        ['Chronicler', 'Historian', 'Maintains historical market data and patterns', 'Market history, pattern recognition'],
        ['Prophet', 'Predictor', 'Generates forecasts from aggregated data', '"Prophet Predicts" daily forecasts'],
    ],
    [0.10, 0.13, 0.35, 0.35]
))
story.append(Spacer(1, 6))
story.append(callout('Bottom line: Cline is a dev tool for building Predictly. z-ai-web-dev-sdk is the AI engine for running Predictly. Keep them separate.'))
story.append(Spacer(1, 18))


# ══════════════════════════════════════════════════════════
# SECTION 10: AI AGENTS ANSWER
# ══════════════════════════════════════════════════════════
story.extend(add_major_section('10. AI Agents - Free API Architecture'))

story.append(h2('10.1 Chosen Free APIs for AI Agent System'))
story.append(body('The entire AI agent system runs on <b>zero paid external APIs</b>. Every component uses free-tier services already available in the project stack.'))
story.append(Spacer(1, 6))

story.append(make_table(
    ['Component', 'Service', 'Tier', 'Purpose', 'Cost'],
    [
        ['LLM Engine', 'z-ai-web-dev-sdk', 'Free (in project)', 'All 6 agents: Scout, Oddsmaker, Sentry, Oracle, Chronicler, Prophet', '$0/mo'],
        ['Agent Runtime', 'Supabase Edge Functions', 'Free tier (500K invocations)', 'Run agent tasks, process market data, trigger alerts', '$0/mo'],
        ['Scheduling', 'Cron via Vercel', 'Free tier', 'Schedule agent runs: Scout every 4h, Oddsmaker every 1h, Sentry real-time', '$0/mo'],
        ['Data Storage', 'Supabase PostgreSQL', 'Free tier (500MB)', 'Market data, agent outputs, user interactions', '$0/mo'],
        ['Real-time Updates', 'Supabase Realtime', 'Free tier (200 concurrent)', 'Push agent insights to users in real-time', '$0/mo'],
        ['News/Data Source', 'Public APIs + RSS', 'Free', 'Market data input for Scout and Oracle agents', '$0/mo'],
    ],
    [0.13, 0.18, 0.18, 0.35, 0.08]
))
story.append(Spacer(1, 8))

story.append(h2('10.2 Agent Architecture Detail'))
story.append(body('Each agent is a Supabase Edge Function that calls z-ai-web-dev-sdk for LLM reasoning and Supabase for data access. The architecture is:'))
story.append(Spacer(1, 4))
story.append(body('<b>Data Input -> Edge Function -> z-ai-web-dev-sdk LLM -> Structured Output -> Supabase DB -> User Notification</b>'))
story.append(Spacer(1, 6))

story.append(make_table(
    ['Agent', 'Trigger', 'LLM Prompt Focus', 'Output', 'Frequency'],
    [
        ['Scout', 'Cron (4h) + on-demand', 'Analyze market trends, news sentiment, social signals', 'Market insight report (3-5 sentences), confidence score', '6x/day + on-demand'],
        ['Oddsmaker', 'Cron (1h) + on trade', 'Calculate probability from market data, adjust for volume', 'Updated odds (YES/NO probability)', '24x/day + real-time'],
        ['Sentry', 'On trade + cron (15min)', 'Assess portfolio risk, detect unusual activity', 'Risk level (1-5), hedging recommendation', '96x/day + real-time'],
        ['Oracle', 'On resolution trigger', 'Verify outcome from multiple sources, resolve market', 'Resolution verdict + source citations', 'On-demand'],
        ['Chronicler', 'Cron (daily)', 'Record market history, identify patterns', 'Historical analysis, pattern alerts', '1x/day'],
        ['Prophet', 'Cron (daily)', 'Generate forecasts from aggregated data', '"Prophet Predicts" daily forecast with confidence', '1x/day'],
    ],
    [0.10, 0.15, 0.28, 0.28, 0.13]
))
story.append(Spacer(1, 8))

story.append(h2('10.3 Cost Projection'))
story.append(make_table(
    ['Month', 'Users', 'Agent Calls/Day', 'Supabase Usage', 'z-ai-web-dev-sdk', 'Total Cost'],
    [
        ['Month 1', '500', '~2,000', 'Free tier', 'Free', '$0'],
        ['Month 2', '2,000', '~8,000', 'Free tier', 'Free', '$0'],
        ['Month 3', '5,000', '~20,000', 'Free tier (near limit)', 'Free', '$0'],
        ['Month 6', '15,000', '~60,000', '$25/mo (Supabase Pro)', 'Free', '$25/mo'],
        ['Month 12', '50,000', '~200,000', '$25/mo', 'Free (scaled)', '$25/mo'],
    ],
    [0.10, 0.10, 0.15, 0.25, 0.20, 0.12]
))
story.append(Spacer(1, 6))
story.append(callout('The entire AI agent system costs $0 for the first 3 months and scales to only $25/month at 15,000 users. This is the bootstrap advantage of z-ai-web-dev-sdk.'))
story.append(Spacer(1, 8))

story.append(h2('10.4 No External Paid APIs Needed'))
story.append(body('The z-ai-web-dev-sdk provides the LLM backbone for all agent reasoning. Supabase provides both compute (Edge Functions) and storage (PostgreSQL). Vercel provides scheduling (Cron). There is no need for:'))
story.append(bullet('OpenAI/Anthropic API (replaced by z-ai-web-dev-sdk)'))
story.append(bullet('AWS Lambda (replaced by Supabase Edge Functions)'))
story.append(bullet('Redis/Upstash (replaced by Supabase Realtime)'))
story.append(bullet('Paid cron services (replaced by Vercel Cron)'))
story.append(bullet('External news APIs (replaced by free RSS + web scraping via z-ai-web-dev-sdk)'))
story.append(Spacer(1, 6))
story.append(body('This architecture keeps the platform at <b>$0 operating cost until product-market fit is proven</b>, at which point the modest $25/month Supabase Pro upgrade is easily covered by revenue from withdrawal fees, boosted markets, and MaaS widgets.'))

# ── BUILD ──
doc.multiBuild(story)
print(f"Body PDF generated: {BODY_PDF}")
