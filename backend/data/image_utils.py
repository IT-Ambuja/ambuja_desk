import os
from PIL import Image

def compress_image_to_20kb(filepath, target_kb=20):
    try:
        # Check if file exists and is an image based on extension
        ext = os.path.splitext(filepath)[1].lower()
        if ext not in ['.jpg', '.jpeg', '.png', '.gif']:
            return False
            
        target_bytes = target_kb * 1024
        
        # If it's already smaller, do nothing
        if os.path.getsize(filepath) <= target_bytes:
            return True
            
        img = Image.open(filepath)
        
        # Convert to RGB if it's PNG with transparency or RGBA
        if img.mode in ('RGBA', 'P', 'LA'):
            img = img.convert('RGB')
            
        quality = 90
        # Start compressing loop
        while True:
            # Save to the same file
            img.save(filepath, format='JPEG', quality=quality, optimize=True)
            size = os.path.getsize(filepath)
            
            if size <= target_bytes or quality <= 10:
                break
                
            # If still too big, reduce quality
            quality -= 10
            
            # If quality is low and it's still too big, scale down resolution
            if quality < 20 and size > target_bytes:
                width, height = img.size
                # If image is very small already, break to avoid infinite loop
                if width < 50 or height < 50:
                    break
                img = img.resize((int(width * 0.8), int(height * 0.8)), Image.Resampling.LANCZOS)
                quality = 60 # Reset quality slightly after resize to keep it legible
                
        return True
    except Exception as e:
        print(f"Error compressing image {filepath}: {e}")
        return False
