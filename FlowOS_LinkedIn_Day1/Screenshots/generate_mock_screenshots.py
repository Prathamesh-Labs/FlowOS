import os
from PIL import Image, ImageDraw, ImageFont

def get_font(font_name, size):
    try:
        if font_name == 'bold':
            return ImageFont.truetype("C:\\Windows\\Fonts\\segoeuib.ttf", size)
        elif font_name == 'mono':
            return ImageFont.truetype("C:\\Windows\\Fonts\\consolai.ttf", size)
        else:
            return ImageFont.truetype("C:\\Windows\\Fonts\\segoeui.ttf", size)
    except IOError:
        return ImageFont.load_default()

def draw_window_header(draw, width, url):
    # Top browser header bar
    draw.rectangle([0, 0, width, 50], fill='#0d111a')
    
    # 3 Dots (Close, Min, Max)
    draw.ellipse([15, 18, 27, 30], fill='#ff5f56')
    draw.ellipse([35, 18, 47, 30], fill='#ffbd2e')
    draw.ellipse([55, 18, 67, 30], fill='#27c93f')
    
    # URL bar
    draw.rounded_rectangle([100, 10, width - 100, 40], radius=6, fill='#161b26', outline='#222c3d', width=1)
    
    font_url = get_font('regular', 14)
    # Draw URL text
    draw.text((120, 14), url, fill='#94a3b8', font=font_url)

def get_save_path(filename):
    # Since the script runs inside the workspace directory, we save directly to the current directory
    # If the directory we are in is not Screenshots, we create and use Screenshots/
    if os.path.basename(os.getcwd()) == 'Screenshots':
        return filename
    else:
        os.makedirs("Screenshots", exist_ok=True)
        return os.path.join("Screenshots", filename)

def create_command_center():
    w, h = 920, 750
    img = Image.new('RGB', (w, h), color='#07090e')
    draw = ImageDraw.Draw(img)
    
    # Background glowing gradients (simulated by drawing soft large circles or ellipses)
    draw.rectangle([0, 0, w, h], fill='#07090e')
    
    # Glassmorphic ambient glows
    glow = Image.new('RGB', (w, h), color='#07090e')
    glow_draw = ImageDraw.Draw(glow)
    glow_draw.ellipse([w - 300, 50, w + 100, 450], fill='#1e1e50') # Indigo glow
    glow_draw.ellipse([-100, h - 300, 300, h + 100], fill='#2c113b') # Purple glow
    img = Image.blend(img, glow, 0.45)
    draw = ImageDraw.Draw(img)
    
    # Window Frame Header
    draw_window_header(draw, w, "http://localhost:8000/#today")
    
    # Fonts
    font_h1 = get_font('bold', 28)
    font_h2 = get_font('bold', 20)
    font_body = get_font('regular', 15)
    font_body_bold = get_font('bold', 15)
    font_sm = get_font('regular', 12)
    font_sm_bold = get_font('bold', 12)
    font_timer = get_font('bold', 48)
    
    # Top branding bar in the content area
    draw.text((30, 75), "FlowOS", fill='#ffffff', font=font_h1)
    draw.rounded_rectangle([140, 78, 230, 102], radius=4, fill='#1e1b4b', outline='#6366f1', width=1)
    draw.text((150, 81), "DEMO ACTIVE", fill='#818cf8', font=font_sm_bold)
    
    # Tabs Indicator
    draw.text((w - 320, 80), "LIVE  \u2022  PLAN  \u2022  REALITY  \u2022  ANALYTICS", fill='#94a3b8', font=font_sm_bold)
    
    # LEFT COLUMN: Metrics & Consistency (x: 30 to 280)
    col1_x = 30
    col1_w = 260
    
    # Card 1: Circadian Status / Day Balance
    draw.rounded_rectangle([col1_x, 130, col1_x + col1_w, 290], radius=10, fill='#111522', outline='#222b44', width=1)
    draw.text((col1_x + 20, 150), "DAY BALANCE", fill='#a855f7', font=font_sm_bold)
    draw.text((col1_x + 20, 175), "78%", fill='#ffffff', font=font_h1)
    draw.text((col1_x + 90, 185), "ON TRACK", fill='#10b981', font=font_sm_bold)
    
    # Progress Bar (circular ring simulated with arc, or horizontal track)
    draw.rounded_rectangle([col1_x + 20, 225, col1_x + col1_w - 20, 235], radius=5, fill='#1a2035')
    draw.rounded_rectangle([col1_x + 20, 225, col1_x + 190, 235], radius=5, fill='#a855f7') # 78% filled
    draw.text((col1_x + 20, 250), "Buffer: 45m left", fill='#94a3b8', font=font_sm)
    draw.text((col1_x + col1_w - 90, 250), "Bedtime safe", fill='#10b981', font=font_sm)
    
    # Card 2: Quick Stats / Wellness
    draw.rounded_rectangle([col1_x, 310, col1_x + col1_w, 510], radius=10, fill='#111522', outline='#222b44', width=1)
    draw.text((col1_x + 20, 330), "WELLNESS FUELS", fill='#10b981', font=font_sm_bold)
    
    # Hydration Row
    draw.text((col1_x + 20, 365), "Hydration", fill='#94a3b8', font=font_body)
    draw.text((col1_x + col1_w - 90, 365), "5/8 Glass", fill='#ffffff', font=font_body_bold)
    draw.rounded_rectangle([col1_x + 20, 390, col1_x + col1_w - 20, 396], radius=3, fill='#1a2035')
    draw.rounded_rectangle([col1_x + 20, 390, col1_x + 160, 396], radius=3, fill='#06b6d4')
    
    # Nutrition Row
    draw.text((col1_x + 20, 420), "Fuel State", fill='#94a3b8', font=font_body)
    draw.text((col1_x + col1_w - 90, 420), "High (90%)", fill='#ffffff', font=font_body_bold)
    draw.rounded_rectangle([col1_x + 20, 445, col1_x + col1_w - 20, 451], radius=3, fill='#1a2035')
    draw.rounded_rectangle([col1_x + 20, 445, col1_x + 210, 451], radius=3, fill='#10b981')
    
    # Focus Streaks
    draw.text((col1_x + 20, 475), "Focus Streak: 4 days", fill='#f59e0b', font=font_sm_bold)
    
    # Card 3: Today's High-Level Goals
    draw.rounded_rectangle([col1_x, 530, col1_x + col1_w, 715], radius=10, fill='#111522', outline='#222b44', width=1)
    draw.text((col1_x + 20, 550), "ACTIVE GOALS & MISSION", fill='#6366f1', font=font_sm_bold)
    draw.text((col1_x + 20, 580), " Launch FlowOS Product", fill='#ffffff', font=font_body_bold)
    draw.text((col1_x + 40, 605), "- Slide deck drafts: 100%", fill='#94a3b8', font=font_sm)
    draw.text((col1_x + 40, 625), "- Interactive demo: 100%", fill='#94a3b8', font=font_sm)
    draw.text((col1_x + 40, 645), "- LinkedIn Launch Carousel", fill='#f8fafc', font=font_sm_bold)
    draw.text((col1_x + 20, 675), " Keep Circadian Rhythm", fill='#94a3b8', font=font_body)
    
    # RIGHT COLUMN: Command Center Dashboard (x: 310 to 890)
    col2_x = 310
    col2_w = 580
    
    # 1. Main Mission Box (Hero Focus)
    draw.rounded_rectangle([col2_x, 130, col2_x + col2_w, 390], radius=12, fill='#14192b', outline='#3b4b7a', width=2)
    
    # Glassy header background in card
    draw.rounded_rectangle([col2_x + 2, 132, col2_x + col2_w - 2, 175], radius=10, fill='#1b223d')
    draw.text((col2_x + 25, 145), "CURRENT ACTIVE MISSION (FOCUS)", fill='#818cf8', font=font_sm_bold)
    
    # Focus Title
    draw.text((col2_x + 25, 200), "DESIGN LINKEDIN CAROUSEL SLIDES", fill='#ffffff', font=font_h2)
    draw.text((col2_x + 25, 230), "Focus Room synth: Alpha Waves (10Hz) + Soft Rain", fill='#94a3b8', font=font_body)
    
    # Large Timer
    draw.text((col2_x + 25, 275), "34:12", fill='#ffffff', font=font_timer)
    
    # Timer Buttons
    draw.rounded_rectangle([col2_x + 220, 285, col2_x + 320, 325], radius=6, fill='#10b981')
    draw.text((col2_x + 245, 296), "PAUSE", fill='#07090e', font=font_body_bold)
    
    draw.rounded_rectangle([col2_x + 335, 285, col2_x + 435, 325], radius=6, fill='#1e293b', outline='#475569')
    draw.text((col2_x + 360, 296), "+ 5 MIN", fill='#ffffff', font=font_body_bold)
    
    # Next Event Text
    draw.text((col2_x + 25, 355), "Next Event: 4:30 PM - Restorative Walk (20m)", fill='#64748b', font=font_sm_bold)
    
    # 2. Quick Reality Triggers Bar (Interactive Section)
    draw.rounded_rectangle([col2_x, 410, col2_x + col2_w, 560], radius=10, fill='#111522', outline='#222b44', width=1)
    draw.text((col2_x + 20, 430), "QUICK REALITY TRIGGERS - WHAT JUST CHANGED?", fill='#f59e0b', font=font_sm_bold)
    
    # Render Grid of buttons
    triggers = [
        ("Woke Late", '#ec4899'),
        ("Task Overrun", '#f59e0b'),
        ("Meeting Overrun", '#ef4444'),
        ("Lost Focus", '#818cf8'),
        ("Need Break", '#06b6d4'),
        ("Completed Early", '#10b981')
    ]
    
    for idx, (label, color) in enumerate(triggers):
        r_idx = idx // 3
        c_idx = idx % 3
        
        bx = col2_x + 20 + c_idx * 180
        by = 465 + r_idx * 42
        
        # Hovered effect for "Woke Late" to draw attention
        is_hovered = (label == "Woke Late")
        bg_btn = '#31102f' if is_hovered else '#1b2234'
        border_btn = '#ec4899' if is_hovered else '#2d3748'
        text_btn_color = '#ec4899' if is_hovered else '#cbd5e1'
        
        draw.rounded_rectangle([bx, by, bx + 165, by + 34], radius=6, fill=bg_btn, outline=border_btn, width=2 if is_hovered else 1)
        draw.text((bx + 18 if not is_hovered else bx + 22, by + 8), label, fill=text_btn_color, font=font_sm_bold if is_hovered else font_sm)
        if is_hovered:
            # Draw cursor/pointer circle
            draw.ellipse([bx + 130, by + 20, bx + 144, by + 34], fill='#ffffff', outline='#ffffff')
            
    # 3. Mini Schedule Preview
    draw.rounded_rectangle([col2_x, 580, col2_x + col2_w, 715], radius=10, fill='#111522', outline='#222b44', width=1)
    draw.text((col2_x + 20, 595), "UPCOMING DAY TIMELINE", fill='#94a3b8', font=font_sm_bold)
    
    # Draw timeline track
    draw.line([col2_x + 35, 650, col2_x + col2_w - 35, 650], fill='#2d3748', width=4)
    
    # Focus Block Dot
    draw.ellipse([col2_x + 80, 642, col2_x + 96, 658], fill='#6366f1')
    draw.text((col2_x + 60, 670), "Active (Study)", fill='#6366f1', font=font_sm)
    
    # Break Dot
    draw.ellipse([col2_x + 220, 644, col2_x + 232, 656], fill='#a855f7')
    draw.text((col2_x + 205, 670), "Walk (Rest)", fill='#a855f7', font=font_sm)
    
    # Meeting Dot
    draw.ellipse([col2_x + 360, 644, col2_x + 372, 656], fill='#ef4444')
    draw.text((col2_x + 340, 670), "Team Sync (Fixed)", fill='#ef4444', font=font_sm)
    
    # Bedtime Dot
    draw.ellipse([col2_x + 500, 642, col2_x + 516, 658], fill='#10b981')
    draw.text((col2_x + 480, 670), "Bedtime 10:30", fill='#10b981', font=font_sm)
    
    img.save(get_save_path("01_NOW_Command_Center.png"))
    print("01_NOW_Command_Center.png generated.")

def create_reality_trigger():
    w, h = 420, 600
    img = Image.new('RGB', (w, h), color='#07090e')
    draw = ImageDraw.Draw(img)
    
    # Background glassmorphic glow
    glow = Image.new('RGB', (w, h), color='#07090e')
    glow_draw = ImageDraw.Draw(glow)
    glow_draw.ellipse([w//2 - 150, h//2 - 150, w//2 + 150, h//2 + 150], fill='#2d132c')
    img = Image.blend(img, glow, 0.4)
    draw = ImageDraw.Draw(img)
    
    # Window Frame Header
    draw_window_header(draw, w, "http://localhost:8000/#adapt")
    
    # Fonts
    font_h3 = get_font('bold', 18)
    font_body = get_font('regular', 14)
    font_body_bold = get_font('bold', 14)
    font_sm = get_font('regular', 11)
    font_sm_bold = get_font('bold', 11)
    
    # Reality Alert Box
    draw.rounded_rectangle([20, 75, w - 20, 580], radius=12, fill='#14101e', outline='#f59e0b', width=2)
    
    # Title badge
    draw.rounded_rectangle([35, 95, 210, 120], radius=4, fill='#2d1d0c', outline='#f59e0b', width=1)
    draw.text((45, 100), "WHAT CHANGED \u2022 REALITY", fill='#fbbf24', font=font_sm_bold)
    
    # Event title
    draw.text((35, 135), "Late Wake-Up Divergence", fill='#ffffff', font=font_h3)
    
    # Description block
    draw.text((35, 175), "Observation:", fill='#fbbf24', font=font_sm_bold)
    draw.text((35, 195), "Schedule started 45m later than planned\ndue to extended morning fatigue.", fill='#f8fafc', font=font_body)
    
    draw.text((35, 245), "Schedule Impact:", fill='#fbbf24', font=font_sm_bold)
    draw.text((35, 265), "Morning flexible buffer completely compressed.\nRemaining flexible buffer: 15m.\nBedtime sleep window at risk (+30m drift).", fill='#f8fafc', font=font_body)
    
    # Recommendations header
    draw.text((35, 335), "CONCRETE ADAPTATION OPTIONS:", fill='#94a3b8', font=font_sm_bold)
    
    # Option 1 (Recommended)
    draw.rounded_rectangle([35, 360, w - 35, 455], radius=8, fill='#10231c', outline='#10b981', width=2)
    draw.rounded_rectangle([45, 370, 185, 390], radius=4, fill='#10b981')
    draw.text((50, 373), "RECOMMENDED ACTION", fill='#07090e', font=font_sm_bold)
    draw.text((45, 398), "Consolidate Afternoon Focus & Keep Bedtime", fill='#ffffff', font=font_body_bold)
    draw.text((45, 418), "Compress non-critical breaks to 10m. Preserves sleep.", fill='#94a3b8', font=font_sm)
    
    # Cursor pointing at recommended option
    draw.ellipse([w - 65, 405, w - 50, 420], fill='#ffffff', outline='#ffffff')
    
    # Option 2 (Alternative)
    draw.rounded_rectangle([35, 470, w - 35, 550], radius=8, fill='#1b1627', outline='#2d253d', width=1)
    draw.text((45, 482), "Defer 1 Secondary Task to Tomorrow", fill='#cbd5e1', font=font_body_bold)
    draw.text((45, 505), "Reschedule evening reading block. Keeps pacing normal.", fill='#94a3b8', font=font_sm)
    draw.text((45, 525), "Option Action: Move 'Book notes' to tomorrow", fill='#a855f7', font=font_sm_bold)
    
    img.save(get_save_path("02_Reality_Trigger.png"))
    print("02_Reality_Trigger.png generated.")

def create_adaptive_schedule():
    w, h = 420, 600
    img = Image.new('RGB', (w, h), color='#07090e')
    draw = ImageDraw.Draw(img)
    
    # Background glassmorphic glow
    glow = Image.new('RGB', (w, h), color='#07090e')
    glow_draw = ImageDraw.Draw(glow)
    glow_draw.ellipse([w//2 - 150, h//2 - 150, w//2 + 150, h//2 + 150], fill='#0d2822')
    img = Image.blend(img, glow, 0.4)
    draw = ImageDraw.Draw(img)
    
    # Window Frame Header
    draw_window_header(draw, w, "http://localhost:8000/#plan-timeline")
    
    # Fonts
    font_h3 = get_font('bold', 18)
    font_body = get_font('regular', 14)
    font_body_bold = get_font('bold', 14)
    font_sm = get_font('regular', 11)
    font_sm_bold = get_font('bold', 11)
    
    # Content Box
    draw.rounded_rectangle([20, 75, w - 20, 580], radius=12, fill='#0d131a', outline='#10b981', width=2)
    
    # Success badge
    draw.rounded_rectangle([35, 95, 210, 120], radius=4, fill='#112921', outline='#10b981', width=1)
    draw.text((45, 100), "SCHEDULE RECALIBRATED", fill='#34d399', font=font_sm_bold)
    
    # Title
    draw.text((35, 135), "Adapted Circadian Timeline", fill='#ffffff', font=font_h3)
    
    # Narrative
    draw.text((35, 170), "Pushed remaining flexible work and compressed\ntransition buffers. Night sleep cycle fully protected.", fill='#cbd5e1', font=font_body)
    
    # Draw timeline steps
    timeline_y = 225
    steps = [
        ("09:00 AM", "Late Wake-Up Event", '#ec4899', "[Logged] Started day +45m late", False),
        ("10:00 AM", "Deep Focus: Carousel", '#6366f1', "Shifted & Compressed to 90m (was 120m)", True),
        ("12:00 PM", "Fuel Station (Lunch)", '#10b981', "On Time (30m)", False),
        ("12:30 PM", "Collaborative Sync", '#ef4444', "Shifted to 12:30 PM (Fixed)", True),
        ("02:00 PM", "Adaptive Focus", '#818cf8', "Condensed break. Pushed 15m forward", True),
        ("10:30 PM", "Circadian Rest", '#10b981', "Sleep Window PROTECTED", False)
    ]
    
    for idx, (time, title, color, desc, adapted) in enumerate(steps):
        ty = timeline_y + idx * 52
        
        # Draw vertical line between dots
        if idx < len(steps) - 1:
            draw.line([60, ty + 12, 60, ty + 50], fill='#223142', width=2)
            
        # Draw dot
        draw.ellipse([54, ty, 66, ty + 12], fill=color)
        if adapted:
            draw.ellipse([56, ty + 2, 64, ty + 10], fill='#0d131a') # Donut hole for adapted
            
        # Text
        draw.text((80, ty - 2), time, fill='#94a3b8', font=font_sm_bold)
        draw.text((150, ty - 3), title, fill='#ffffff', font=font_body_bold)
        draw.text((80, ty + 16), desc, fill='#10b981' if adapted else '#64748b', font=font_sm_bold if adapted else font_sm)
        
        # Adaptation indicator pill
        if adapted:
            draw.rounded_rectangle([320, ty - 1, 385, ty + 14], radius=3, fill='#112921', outline='#10b981', width=1)
            draw.text((326, ty + 2), "ADAPTED", fill='#10b981', font=font_sm_bold)
            
    img.save(get_save_path("03_Adaptive_Schedule.png"))
    print("03_Adaptive_Schedule.png generated.")

def create_what_if_simulator():
    w, h = 920, 600
    img = Image.new('RGB', (w, h), color='#07090e')
    draw = ImageDraw.Draw(img)
    
    # Background glassmorphic glows
    glow = Image.new('RGB', (w, h), color='#07090e')
    glow_draw = ImageDraw.Draw(glow)
    glow_draw.ellipse([w//2 - 200, h//2 - 200, w//2 + 200, h//2 + 200], fill='#1e2b40')
    img = Image.blend(img, glow, 0.35)
    draw = ImageDraw.Draw(img)
    
    # Window Frame Header
    draw_window_header(draw, w, "http://localhost:8000/#adapt-sandbox")
    
    # Fonts
    font_h1 = get_font('bold', 26)
    font_h2 = get_font('bold', 18)
    font_body = get_font('regular', 14)
    font_body_bold = get_font('bold', 14)
    font_sm = get_font('regular', 11)
    font_sm_bold = get_font('bold', 11)
    
    # Top info
    draw.text((30, 75), "What-If Scenario Sandbox", fill='#ffffff', font=font_h1)
    draw.text((30, 110), "Simulate shifts side-by-side. Your live schedule is unaffected until you choose to commit.", fill='#94a3b8', font=font_body)
    
    # Left Box: Live Path
    box_w = 410
    draw.rounded_rectangle([30, 150, 30 + box_w, 560], radius=10, fill='#0d121f', outline='#222b44', width=1)
    draw.rounded_rectangle([32, 152, 30 + box_w - 2, 195], radius=8, fill='#161d2d')
    draw.text((50, 165), "LIVE PATH (CURRENT SCHEDULE)", fill='#cbd5e1', font=font_h2)
    
    # Live schedule events
    live_events = [
        ("02:00 PM - 03:30 PM", "Core Coding Block", '#6366f1'),
        ("03:30 PM - 04:00 PM", "Transition & Tea Break", '#a855f7'),
        ("04:00 PM - 05:00 PM", "Engineering Synclink", '#ef4444'),
        ("05:00 PM - 06:00 PM", "Evening Gym Workout", '#06b6d4'),
        ("06:00 PM - 07:00 PM", "Daily Recap & Reflection", '#10b981')
    ]
    
    for idx, (time, title, color) in enumerate(live_events):
        y = 215 + idx * 65
        draw.rounded_rectangle([50, y, 420, y + 50], radius=6, fill='#121826', outline='#212a3d', width=1)
        draw.ellipse([65, y + 18, 77, y + 30], fill=color)
        draw.text((95, y + 8), title, fill='#ffffff', font=font_body_bold)
        draw.text((95, y + 26), time, fill='#94a3b8', font=font_sm)
        
    # Right Box: Simulated Path
    draw.rounded_rectangle([480, 150, 480 + box_w, 560], radius=10, fill='#111119', outline='#f59e0b', width=2)
    draw.rounded_rectangle([482, 152, 480 + box_w - 2, 195], radius=8, fill='#251a14')
    draw.text((500, 165), "SIMULATED SANDBOX PATH", fill='#f59e0b', font=font_h2)
    
    # Simulation Details (What if Coding Block overruns by 45m?)
    sim_events = [
        ("02:00 PM - 04:15 PM", "Core Coding Block (+45m Overrun)", '#ec4899', True),
        ("04:15 PM - 04:30 PM", "Compressed Break (-15m Comp)", '#a855f7', True),
        ("04:30 PM - 05:30 PM", "Engineering Synclink (Shifted)", '#ef4444', True),
        ("05:30 PM - 06:15 PM", "Evening Gym Workout (Shifted)", '#06b6d4', True),
        ("06:15 PM - 07:00 PM", "Recap (Compressed to 45m)", '#10b981', True)
    ]
    
    for idx, (time, title, color, changed) in enumerate(sim_events):
        y = 215 + idx * 65
        bg_card = '#1c1511' if changed else '#121826'
        border_card = '#f59e0b' if changed else '#212a3d'
        
        draw.rounded_rectangle([500, y, 870, y + 50], radius=6, fill=bg_card, outline=border_card, width=2 if changed else 1)
        draw.ellipse([515, y + 18, 527, y + 30], fill=color)
        draw.text((545, y + 8), title, fill='#ffffff', font=font_body_bold)
        draw.text((545, y + 26), time, fill='#fbbf24' if changed else '#94a3b8', font=font_sm_bold if changed else font_sm)
        
        if changed:
            # Draw tiny modification pill
            draw.rounded_rectangle([790, y + 15, 855, y + 35], radius=3, fill='#2a1a10', outline='#f59e0b', width=1)
            draw.text((796, y + 19), "SHIFTED", fill='#f59e0b', font=font_sm_bold)
            
    # Bottom action buttons in Sandbox box
    draw.rounded_rectangle([480 + 30, 505, 480 + 190, 545], radius=6, fill='#10b981')
    draw.text((480 + 60, 517), "APPLY TO LIVE DAY", fill='#07090e', font=font_body_bold)
    
    draw.rounded_rectangle([480 + 220, 505, 480 + box_w - 30, 545], radius=6, fill='#1e293b', outline='#475569')
    draw.text((480 + 265, 517), "RESET SANDBOX", fill='#ffffff', font=font_body_bold)
    
    img.save(get_save_path("04_What_If_Simulator.png"))
    print("04_What_If_Simulator.png generated.")

if __name__ == "__main__":
    create_command_center()
    create_reality_trigger()
    create_adaptive_schedule()
    create_what_if_simulator()
