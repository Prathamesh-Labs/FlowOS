import os
import sys
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from PIL import Image

def draw_gradient_background(c, width, height):
    # Base dark background
    c.setFillColor(HexColor('#0a0d14'))
    c.rect(0, 0, width, height, fill=1, stroke=0)
    
    # Glowing ambient accents (simulating glassmorphism glows)
    c.saveState()
    c.setFillAlpha(0.08)
    
    # Top-right indigo glow
    c.setFillColor(HexColor('#6366f1'))
    c.circle(width - 100, height - 100, 350, fill=1, stroke=0)
    
    # Bottom-left purple glow
    c.setFillColor(HexColor('#a855f7'))
    c.circle(100, 100, 350, fill=1, stroke=0)
    
    # Center ambient pink glow (subtle)
    c.setFillAlpha(0.04)
    c.setFillColor(HexColor('#ec4899'))
    c.circle(width / 2, height / 2, 400, fill=1, stroke=0)
    
    c.restoreState()

def draw_header(c, width, height, category="FLOWOS"):
    c.saveState()
    # Brand tag
    c.setFont('Helvetica-Bold', 14)
    c.setFillColor(HexColor('#6366f1'))
    c.drawString(80, height - 80, category.upper())
    
    # Top accent line
    c.setStrokeColor(HexColor('#222b44'))
    c.setLineWidth(1)
    c.line(80, height - 95, width - 80, height - 95)
    c.restoreState()

def draw_footer(c, width, height, page_num, total_pages=7):
    c.saveState()
    # Accent line above footer
    c.setStrokeColor(HexColor('#222b44'))
    c.setLineWidth(1)
    c.line(80, 85, width - 80, 85)
    
    # Left footer text
    c.setFont('Helvetica', 12)
    c.setFillColor(HexColor('#64748b'))
    c.drawString(80, 55, "FlowOS — AI Day & Goal Operating System")
    
    # Right footer page counter
    page_text = f"Slide {page_num} of {total_pages}"
    c.drawRightString(width - 80, 55, page_text)
    c.restoreState()

def draw_card(c, x, y, w, h, border_color='#222b44', fill_color='#111625', fill_alpha=0.72):
    c.saveState()
    # Glass card fill
    c.setFillAlpha(fill_alpha)
    c.setFillColor(HexColor(fill_color))
    # Border stroke
    c.setStrokeColor(HexColor(border_color))
    c.setLineWidth(1.5)
    # Draw rounded card
    c.roundRect(x, y, w, h, 14, fill=1, stroke=1)
    c.restoreState()

def draw_image_or_placeholder(c, filename, x, y, w, h, instruction=""):
    filepath = os.path.join("Screenshots", filename)
    if os.path.exists(filepath):
        try:
            # Check aspect ratio to fit image beautifully
            img = Image.open(filepath)
            img_w, img_h = img.size
            img_ratio = img_w / img_h
            box_ratio = w / h
            
            if img_ratio > box_ratio:
                # Width is the limiting factor
                draw_w = w
                draw_h = w / img_ratio
            else:
                # Height is the limiting factor
                draw_h = h
                draw_w = h * img_ratio
            
            # Center coordinates inside the card frame
            draw_x = x + (w - draw_w) / 2
            draw_y = y + (h - draw_h) / 2
            
            # Draw actual image
            c.drawImage(filepath, draw_x, draw_y, width=draw_w, height=draw_h)
            
            # Draw subtle glass glow border around image
            c.saveState()
            c.setStrokeAlpha(0.08)
            c.setStrokeColor(HexColor('#ffffff'))
            c.setLineWidth(1)
            c.roundRect(draw_x, draw_y, draw_w, draw_h, 8, fill=0, stroke=1)
            c.restoreState()
            return
        except Exception as e:
            print(f"Error loading image {filename}: {e}")
            
    # Draw fallback placeholder
    draw_card(c, x, y, w, h, border_color='#6366f1', fill_color='#141b2d', fill_alpha=0.6)
    
    c.saveState()
    # Draw placeholder indicator
    c.setFont('Helvetica-Bold', 18)
    c.setFillColor(HexColor('#818cf8'))
    c.drawCentredString(x + w/2, y + h/2 + 20, "[ SCREENSHOT PLACEHOLDER ]")
    
    c.setFont('Helvetica-Bold', 14)
    c.setFillColor(HexColor('#f8fafc'))
    c.drawCentredString(x + w/2, y + h/2 - 15, filename)
    
    # Draw instruction
    c.setFont('Helvetica', 12)
    c.setFillColor(HexColor('#94a3b8'))
    words = instruction.split(' ')
    lines = []
    current_line = ""
    for word in words:
        if len(current_line + " " + word) < 50:
            current_line += (" " if current_line else "") + word
        else:
            lines.append(current_line)
            current_line = word
    if current_line:
        lines.append(current_line)
        
    line_y = y + h/2 - 50
    for line in lines:
        c.drawCentredString(x + w/2, line_y, line)
        line_y -= 18
        
    c.restoreState()

def create_carousel():
    os.makedirs("Carousel", exist_ok=True)
    os.makedirs("Screenshots", exist_ok=True)
    
    pdf_path = os.path.join("Carousel", "FlowOS_LinkedIn_Day1_Carousel.pdf")
    width, height = 1080, 1350
    c = canvas.Canvas(pdf_path, pagesize=(width, height))
    
    # ----------------------------------------------------
    # SLIDE 1: HOOK (HERO NOW COMMAND CENTER)
    # ----------------------------------------------------
    draw_gradient_background(c, width, height)
    draw_header(c, width, height, "FLOWOS LAUNCH")
    
    c.saveState()
    # Headline (FlowOS Gradient Colors)
    c.setFont('Helvetica-Bold', 54)
    c.setFillColor(HexColor('#818cf8'))
    c.drawString(80, height - 200, "I BUILT A DAY")
    c.drawString(80, height - 270, "OPERATING SYSTEM.")
    
    # Subtitle
    c.setFont('Helvetica', 24)
    c.setFillColor(HexColor('#94a3b8'))
    c.drawString(80, height - 330, "Because real life doesn't follow your schedule.")
    c.restoreState()
    
    # Hero Visual
    draw_image_or_placeholder(
        c, 
        "01_NOW_Command_Center.png", 
        80, 170, 920, 750,
        "Instruction: Open FlowOS, maximize window, load demo data, and take a screenshot of the main NOW Command Center dashboard."
    )
    
    draw_footer(c, width, height, 1)
    c.showPage()
    
    # ----------------------------------------------------
    # SLIDE 2: THE PROBLEM (TIMELINE DRIFT)
    # ----------------------------------------------------
    draw_gradient_background(c, width, height)
    draw_header(c, width, height, "THE PROBLEM")
    
    c.saveState()
    # Headline
    c.setFont('Helvetica-Bold', 44)
    c.setFillColor(HexColor('#f8fafc'))
    c.drawString(80, height - 200, "YOUR PLAN WAS PERFECT.")
    c.setFont('Helvetica-Bold', 36)
    c.setFillColor(HexColor('#f59e0b'))
    c.drawString(80, height - 260, "Until reality happened.")
    
    # Diagram details
    c.setFont('Helvetica', 22)
    c.setFillColor(HexColor('#94a3b8'))
    c.drawString(80, height - 330, "One delayed task can break the rest of the day.")
    c.restoreState()
    
    # Draw timeline illustration
    # Planned Side
    draw_card(c, 80, 480, 420, 420, border_color='#6366f1', fill_color='#111625', fill_alpha=0.8)
    c.saveState()
    c.setFont('Helvetica-Bold', 22)
    c.setFillColor(HexColor('#6366f1'))
    c.drawString(120, 840, "PLANNED TIMELINE")
    
    # Timeline nodes
    y_nodes = [760, 660, 560]
    labels = [
        ("09:00 AM", "Coding Focus Block", "#f8fafc"),
        ("10:30 AM", "Design Review", "#94a3b8"),
        ("11:30 AM", "Lunch & Movement", "#94a3b8")
    ]
    for i, y_node in enumerate(y_nodes):
        # Draw node circle
        c.setFillColor(HexColor('#6366f1'))
        c.circle(140, y_node, 10, fill=1, stroke=0)
        if i < 2:
            c.setStrokeColor(HexColor('#222b44'))
            c.setLineWidth(3)
            c.line(140, y_node, 140, y_nodes[i+1])
            
        c.setFont('Helvetica-Bold', 18)
        c.setFillColor(HexColor(labels[i][2]))
        c.drawString(170, y_node - 6, labels[i][0])
        c.setFont('Helvetica', 18)
        c.drawString(290, y_node - 6, labels[i][1])
    c.restoreState()
    
    # Reality Shift arrow
    c.saveState()
    c.setFont('Helvetica-Bold', 40)
    c.setFillColor(HexColor('#f59e0b'))
    c.drawCentredString(540, 680, "➔")
    c.setFont('Helvetica-Bold', 14)
    c.drawCentredString(540, 650, "REALITY")
    c.drawCentredString(540, 630, "COLLISION")
    c.restoreState()
    
    # Broken/Delayed Side
    draw_card(c, 580, 480, 420, 420, border_color='#f59e0b', fill_color='#181510', fill_alpha=0.8)
    c.saveState()
    c.setFont('Helvetica-Bold', 22)
    c.setFillColor(HexColor('#f59e0b'))
    c.drawString(620, 840, "REALITY TIMELINE")
    
    # Overrun block
    c.saveState()
    c.setFillAlpha(0.1)
    c.setFillColor(HexColor('#f59e0b'))
    c.setStrokeColor(HexColor('#f59e0b'))
    c.setLineWidth(1)
    c.roundRect(620, 720, 340, 80, 8, fill=1, stroke=1)
    c.restoreState()
    
    c.setFont('Helvetica-Bold', 16)
    c.setFillColor(HexColor('#f59e0b'))
    c.drawString(640, 765, "+45 MIN OVERRUN")
    c.setFont('Helvetica', 14)
    c.setFillColor(HexColor('#94a3b8'))
    c.drawString(640, 740, "Coding sprint took longer than planned")
    
    # Pushed timeline nodes
    y_nodes_r = [640, 540]
    labels_r = [
        ("11:15 AM", "Design Review (Delayed)", '#ef4444'),
        ("12:15 PM", "Lunch & Movement (Pushed)", '#94a3b8')
    ]
    for i, y_node in enumerate(y_nodes_r):
        c.setFillColor(HexColor('#ef4444'))
        c.circle(640, y_node, 10, fill=1, stroke=0)
        if i < 1:
            c.setStrokeColor(HexColor('#f59e0b'))
            c.setLineWidth(2)
            c.line(640, y_node, 640, y_nodes_r[i+1])
            
        c.setFont('Helvetica-Bold', 18)
        c.setFillColor(HexColor(labels_r[i][2]))
        c.drawString(670, y_node - 6, labels_r[i][0])
        c.setFont('Helvetica', 18)
        c.drawString(790, y_node - 6, labels_r[i][1])
    c.restoreState()
    
    # Bottom callout
    draw_card(c, 80, 180, 920, 220, border_color='#222b44', fill_color='#111625', fill_alpha=0.6)
    c.saveState()
    c.setFont('Helvetica-Bold', 26)
    c.setFillColor(HexColor('#f8fafc'))
    c.drawCentredString(540, 310, "Static planners break. FlowOS recalculates.")
    
    c.setFont('Helvetica', 18)
    c.setFillColor(HexColor('#94a3b8'))
    c.drawCentredString(540, 260, "When one delay pushes everything else, FlowOS shifts the schedule")
    c.drawCentredString(540, 220, "while protecting your hard bedtime and circadian recovery windows.")
    c.restoreState()
    
    draw_footer(c, width, height, 2)
    c.showPage()
    
    # ----------------------------------------------------
    # SLIDE 3: THE IDEA (ADAPTIVE LOOP)
    # ----------------------------------------------------
    draw_gradient_background(c, width, height)
    draw_header(c, width, height, "THE IDEA")
    
    c.saveState()
    # Headline
    c.setFont('Helvetica-Bold', 44)
    c.setFillColor(HexColor('#818cf8'))
    c.drawString(80, height - 200, "SO I BUILT FLOWOS.")
    
    # Subtitle
    c.setFont('Helvetica', 24)
    c.setFillColor(HexColor('#94a3b8'))
    c.drawString(80, height - 250, "A Day Operating System designed to adapt when reality changes.")
    c.restoreState()
    
    # Draw Core Loop nodes
    loop_steps = [
        ("1. PLAN", "Decompose goals into tasks & timeline", "#6366f1"),
        ("2. EXECUTE", "Active focus block & countdown timer", "#a855f7"),
        ("3. REALITY CHANGES", "Delays, meetings, or energy shifts occur", "#f59e0b"),
        ("4. RECALIBRATE", "System recalculates remaining day instantly", "#ec4899"),
        ("5. CONTINUE", "Proceed with a realistic, stress-free plan", "#10b981")
    ]
    
    y_start = 850
    node_h = 100
    gap = 40
    
    for i, step in enumerate(loop_steps):
        ny = y_start - i * (node_h + gap)
        draw_card(c, 240, ny, 600, node_h, border_color=step[2], fill_color='#111625', fill_alpha=0.85)
        
        c.saveState()
        # Step number/title
        c.setFont('Helvetica-Bold', 22)
        c.setFillColor(HexColor(step[2]))
        c.drawString(280, ny + 55, step[0])
        
        # Step desc
        c.setFont('Helvetica', 16)
        c.setFillColor(HexColor('#f8fafc'))
        c.drawString(280, ny + 20, step[1])
        
        # Step visual indicator
        c.setFillColor(HexColor(step[2]))
        c.circle(580 + 200, ny + 50, 12, fill=1, stroke=0)
        c.setFont('Helvetica-Bold', 14)
        c.setFillColor(HexColor('#0a0d14'))
        c.drawCentredString(580 + 200, ny + 45, str(i + 1))
        
        # Downward connecting arrow
        if i < 4:
            c.setStrokeColor(HexColor('#222b44'))
            c.setLineWidth(3)
            # Arrow stem
            c.line(540, ny, 540, ny - gap)
            # Arrow head
            c.line(530, ny - gap + 10, 540, ny - gap)
            c.line(550, ny - gap + 10, 540, ny - gap)
            
        c.restoreState()
        
    # Recirculating loop arrow from Step 5 to Step 1
    c.saveState()
    c.setStrokeAlpha(0.2)
    c.setStrokeColor(HexColor('#6366f1'))
    c.setLineWidth(3.5)
    c.line(240, y_start - 4 * (node_h + gap) + node_h/2, 140, y_start - 4 * (node_h + gap) + node_h/2) # horizontal out from step 5
    c.line(140, y_start - 4 * (node_h + gap) + node_h/2, 140, y_start + node_h/2) # vertical up
    c.line(140, y_start + node_h/2, 240, y_start + node_h/2) # horizontal into step 1
    
    # Arrow head pointing into step 1
    c.line(230, y_start + node_h/2 + 10, 240, y_start + node_h/2)
    c.line(230, y_start + node_h/2 - 10, 240, y_start + node_h/2)
    c.restoreState()
    
    draw_footer(c, width, height, 3)
    c.showPage()
    
    # ----------------------------------------------------
    # SLIDE 4: REALITY TRIGGERS (ADAPTIVE SCHEDULING)
    # ----------------------------------------------------
    draw_gradient_background(c, width, height)
    draw_header(c, width, height, "REALITY TRIGGERS")
    
    c.saveState()
    # Headline
    c.setFont('Helvetica-Bold', 44)
    c.setFillColor(HexColor('#f8fafc'))
    c.drawString(80, height - 200, "WHAT HAPPENS WHEN THE PLAN BREAKS?")
    
    # Subtitle
    c.setFont('Helvetica', 22)
    c.setFillColor(HexColor('#94a3b8'))
    c.drawString(80, height - 250, "Log reality events. FlowOS automatically shifts remaining blocks.")
    c.restoreState()
    
    # Screenshot 1 (Reality Trigger Modal)
    draw_image_or_placeholder(
        c, 
        "02_Reality_Trigger.png", 
        80, 270, 420, 600,
        "Screenshot 2: Reality Trigger interface (e.g. Wake up late / Meeting overrun / Task took longer modal)."
    )
    
    # Transition indicator
    c.saveState()
    c.setFont('Helvetica-Bold', 48)
    c.setFillColor(HexColor('#ec4899'))
    c.drawCentredString(540, 560, "➔")
    c.setFont('Helvetica-Bold', 14)
    c.setFillColor(HexColor('#ec4899'))
    c.drawCentredString(540, 520, "RECALIBRATE")
    c.restoreState()
    
    # Screenshot 2 (Adapted Schedule)
    draw_image_or_placeholder(
        c, 
        "03_Adaptive_Schedule.png", 
        580, 270, 420, 600,
        "Screenshot 3: Recalibrated schedule showing pushed focus blocks or timeline adaptation."
    )
    
    # Bottom callout
    c.saveState()
    c.setFont('Helvetica-Bold', 22)
    c.setFillColor(HexColor('#f8fafc'))
    c.drawCentredString(540, 200, "One change shouldn't destroy the entire day.")
    c.setFont('Helvetica', 16)
    c.setFillColor(HexColor('#94a3b8'))
    c.drawCentredString(540, 160, "Reality Triggers recalculate your plan dynamically, letting you proceed with full clarity.")
    c.restoreState()
    
    draw_footer(c, width, height, 4)
    c.showPage()
    
    # ----------------------------------------------------
    # SLIDE 5: WHAT-IF SIMULATOR
    # ----------------------------------------------------
    draw_gradient_background(c, width, height)
    draw_header(c, width, height, "WHAT-IF SIMULATION")
    
    c.saveState()
    # Headline
    c.setFont('Helvetica-Bold', 44)
    c.setFillColor(HexColor('#818cf8'))
    c.drawString(80, height - 200, "WHAT IF I CHANGE THE PLAN?")
    
    # Subtitle
    c.setFont('Helvetica', 22)
    c.setFillColor(HexColor('#94a3b8'))
    c.drawString(80, height - 250, "Test schedule changes side-by-side without affecting your live day.")
    c.restoreState()
    
    # What-If Visual
    draw_image_or_placeholder(
        c, 
        "04_What_If_Simulator.png", 
        80, 320, 920, 600,
        "Screenshot 4: What-If Scenario Sandbox showing simulated scenario adjustments."
    )
    
    # Sandbox options list
    draw_card(c, 80, 150, 920, 130, border_color='#222b44', fill_color='#111625', fill_alpha=0.6)
    c.saveState()
    c.setFont('Helvetica-Bold', 18)
    c.setFillColor(HexColor('#f8fafc'))
    c.drawString(110, 240, "Try scenarios like:")
    
    c.setFont('Helvetica', 16)
    c.setFillColor(HexColor('#94a3b8'))
    c.drawString(110, 205, "• What if this coding block takes 2 hours?")
    c.drawString(110, 175, "• What if I add a last-minute team sync?")
    
    c.drawString(540, 205, "• What if I skip this workout to finish early?")
    c.drawString(540, 175, "• What if I extend my evening wind-down?")
    c.restoreState()
    
    draw_footer(c, width, height, 5)
    c.showPage()
    
    # ----------------------------------------------------
    # SLIDE 6: THE SYSTEM
    # ----------------------------------------------------
    draw_gradient_background(c, width, height)
    draw_header(c, width, height, "PRODUCT METRICS & ARCHITECTURE")
    
    c.saveState()
    # Headline
    c.setFont('Helvetica-Bold', 44)
    c.setFillColor(HexColor('#f8fafc'))
    c.drawString(80, height - 200, "MORE THAN A PLANNER.")
    
    # Subtitle
    c.setFont('Helvetica', 22)
    c.setFillColor(HexColor('#94a3b8'))
    c.drawString(80, height - 250, "FlowOS maps your biological rhythm, active work, and recovery.")
    c.restoreState()
    
    # Six Category Cards (2 columns, 3 rows)
    cards_data = [
        ("🎯 PLAN", "Goals \u2794 Milestones \u2794 Daily Schedule", "#6366f1"),
        ("⚡ ADAPT", "Reality Triggers \u2794 Engine Recalibration", "#a855f7"),
        ("🎧 FOCUS", "Focus Room \u2794 Procedural Web Audio", "#06b6d4"),
        ("📊 LEARN", "Time Leakage \u2794 Heatmap \u2794 Day Replay", "#10b981"),
        ("🤖 ASSIST", "AI Copilot \u2794 Voice Intent Engine", "#ec4899"),
        ("📱 OWN", "Installable PWA \u2794 Offline \u2794 JSON Sync", "#f59e0b")
    ]
    
    card_w, card_h = 430, 210
    col_x = [100, 550]
    row_y = [680, 440, 200]
    
    for idx, (title, desc, color) in enumerate(cards_data):
        cx = col_x[idx % 2]
        cy = row_y[idx // 2]
        
        draw_card(c, cx, cy, card_w, card_h, border_color=color, fill_color='#111625', fill_alpha=0.8)
        
        c.saveState()
        # Card title
        c.setFont('Helvetica-Bold', 22)
        c.setFillColor(HexColor(color))
        c.drawString(cx + 30, cy + card_h - 55, title)
        
        # Card text description
        c.setFont('Helvetica', 16)
        c.setFillColor(HexColor('#f8fafc'))
        c.drawString(cx + 30, cy + card_h - 100, desc.split(" \u2794 ")[0])
        
        # Arrow path details
        c.setFont('Helvetica', 14)
        c.setFillColor(HexColor('#94a3b8'))
        c.drawString(cx + 30, cy + card_h - 145, desc)
        
        # Card border/accent highlight
        c.setFillColor(HexColor(color))
        c.roundRect(cx + card_w - 20, cy + card_h - 35, 10, 15, 2, fill=1, stroke=0)
        c.restoreState()
        
    draw_footer(c, width, height, 6)
    c.showPage()
    
    # ----------------------------------------------------
    # SLIDE 7: LAUNCH (CTA)
    # ----------------------------------------------------
    draw_gradient_background(c, width, height)
    draw_header(c, width, height, "FLOWOS IS LIVE")
    
    c.saveState()
    # Large statement
    c.setFont('Helvetica-Bold', 46)
    c.setFillColor(HexColor('#f8fafc'))
    c.drawCentredString(width/2, height - 250, "Your day doesn't have to be perfect.")
    
    c.setFont('Helvetica-Bold', 38)
    c.setFillColor(HexColor('#818cf8'))
    c.drawCentredString(width/2, height - 310, "Your system should be able to adapt.")
    
    # Main branding card
    draw_card(c, 140, 220, 800, 560, border_color='#6366f1', fill_color='#111625', fill_alpha=0.85)
    
    # Product logo/header
    c.setFont('Helvetica-Bold', 76)
    # Draw FlowOS with a nice shadow or glow
    c.setFillColor(HexColor('#f8fafc'))
    c.drawCentredString(width/2, 630, "FlowOS")
    
    c.setFont('Helvetica-Bold', 26)
    c.setFillColor(HexColor('#a855f7'))
    c.drawCentredString(width/2, 570, "AI DAY & GOAL OPERATING SYSTEM")
    
    # Web URL box
    draw_card(c, 240, 360, 600, 90, border_color='#10b981', fill_color='#0b1d19', fill_alpha=0.9)
    c.setFont('Helvetica-Bold', 26)
    c.setFillColor(HexColor('#10b981'))
    c.drawCentredString(width/2, 395, "https://prathamesh-labs.github.io/FlowOS/")
    
    # Instruction to click
    c.setFont('Helvetica-Bold', 16)
    c.setFillColor(HexColor('#94a3b8'))
    c.drawCentredString(width/2, 300, "FREE \u2022 INSTANT \u2022 NO REGISTRATION REQUIRED")
    c.drawCentredString(width/2, 270, "Runs entirely in your browser. Offline-first & 100% Private.")
    
    # Small footer notes
    c.setFont('Helvetica', 14)
    c.setFillColor(HexColor('#64748b'))
    c.drawCentredString(width/2, 140, "Built from scratch \u2022 Open to feedback \u2022 MIT Licensed")
    c.restoreState()
    
    draw_footer(c, width, height, 7)
    c.showPage()
    
    # Save the canvas
    c.save()
    print("Carousel generated successfully at:", pdf_path)

if __name__ == "__main__":
    create_carousel()
