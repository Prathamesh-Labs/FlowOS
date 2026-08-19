import os
import shutil
import subprocess
from PIL import Image

def convert():
    webp_path = "FlowOS_LinkedIn_Day1_Demo_Recording.webp"
    mp4_path = "FlowOS_LinkedIn_Day1_Demo_Recording.mp4"
    temp_dir = "temp_frames"
    
    if not os.path.exists(webp_path):
        print(f"Error: {webp_path} not found in the current directory.")
        return False
        
    if os.path.exists(temp_dir):
        shutil.rmtree(temp_dir)
    os.makedirs(temp_dir, exist_ok=True)
    
    print(f"Opening WebP animation: {webp_path}")
    img = Image.open(webp_path)
    
    frame_count = 0
    durations = []
    
    try:
        while True:
            frame_path = os.path.join(temp_dir, f"frame_{frame_count:04d}.png")
            # Convert frame to RGB before saving (strips transparency to ensure PNG compatibility)
            frame_rgb = img.copy().convert('RGB')
            frame_rgb.save(frame_path, "PNG")
            
            durations.append(img.info.get('duration', 100))
            frame_count += 1
            img.seek(img.tell() + 1)
    except EOFError:
        pass
        
    print(f"Extracted {frame_count} frames to temporary directory.")
    
    if frame_count == 0:
        print("Error: No frames could be extracted.")
        shutil.rmtree(temp_dir)
        return False
        
    # Calculate average frame duration and corresponding frame rate (FPS)
    avg_dur = sum(durations) / len(durations) if durations else 100.0
    fps = 1000.0 / avg_dur
    print(f"Detected Average Frame Duration: {avg_dur:.2f}ms (FPS: {fps:.2f})")
    
    ffmpeg_path = os.path.join("node_modules", "ffmpeg-static", "ffmpeg.exe")
    if not os.path.exists(ffmpeg_path):
        print(f"Error: FFmpeg binary not found at {ffmpeg_path}.")
        shutil.rmtree(temp_dir)
        return False
        
    # Build standard H.264 MP4 with yuv420p pixel format
    cmd = [
        ffmpeg_path,
        "-y",
        "-framerate", f"{fps:.2f}",
        "-i", os.path.join(temp_dir, "frame_%04d.png"),
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2",
        mp4_path
    ]
    
    print("Compiling MP4 video using FFmpeg...")
    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    
    # Clean up temp frames directory
    print("Cleaning up temporary frame files...")
    shutil.rmtree(temp_dir)
    
    if result.returncode == 0:
        print("Success! MP4 video compiled at:", mp4_path)
        return True
    else:
        print("FFmpeg compilation error:")
        print(result.stderr)
        return False

if __name__ == "__main__":
    convert()
