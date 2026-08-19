import os
import sys
import numpy as np
from PIL import Image

def convert_webp_to_mp4(webp_path, mp4_path):
    # Import cv2 dynamically to check if it is available
    try:
        import cv2
    except ImportError:
        print("Error: opencv-python is not installed yet. Please wait for the installation to finish.")
        return False

    print(f"Opening WebP animation: {webp_path}")
    img = Image.open(webp_path)
    
    frames = []
    durations = []
    
    try:
        while True:
            # Copy frame and convert to RGB
            frame = img.copy().convert('RGB')
            # Convert to numpy array and swap RGB to BGR (OpenCV format)
            frame_np = np.array(frame)
            frame_bgr = cv2.cvtColor(frame_np, cv2.COLOR_RGB2BGR)
            frames.append(frame_bgr)
            
            # Get frame duration in milliseconds
            dur = img.info.get('duration', 100) # Default to 100ms
            durations.append(dur)
            
            img.seek(img.tell() + 1)
    except EOFError:
        pass
        
    print(f"Successfully loaded {len(frames)} frames from WebP.")
    if not frames:
        print("Error: No frames found in the WebP animation.")
        return False
        
    height, width, layers = frames[0].shape
    print(f"Video Dimensions: {width}x{height}")
    
    # Calculate video frame rate from average duration
    avg_dur = sum(durations) / len(durations) if durations else 100.0
    fps = 1000.0 / avg_dur
    print(f"Detected Average Frame Duration: {avg_dur:.2f}ms (FPS: {fps:.2f})")
    
    # Set up video writer (using 'mp4v' or 'H264' codec)
    # mp4v is a standard MPEG-4 Part 2 codec supported by default in OpenCV
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    
    print(f"Writing video file to {mp4_path}...")
    video = cv2.VideoWriter(mp4_path, fourcc, fps, (width, height))
    
    for i, frame in enumerate(frames):
        video.write(frame)
        
    video.release()
    print(f"Video file saved successfully: {mp4_path}")
    return True

if __name__ == "__main__":
    webp_path = "FlowOS_LinkedIn_Day1_Demo_Recording.webp"
    mp4_path = "FlowOS_LinkedIn_Day1_Demo_Recording.mp4"
    if os.path.exists(webp_path):
        convert_webp_to_mp4(webp_path, mp4_path)
    else:
        print(f"Error: {webp_path} not found in the current directory.")
