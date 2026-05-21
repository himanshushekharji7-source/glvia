from rembg import remove
from PIL import Image
import sys

def process_image(input_path, output_path):
    print(f"Processing {input_path}...")
    try:
        input_image = Image.open(input_path)
        output_image = remove(input_image)
        output_image.save(output_path)
        print(f"Saved to {output_path}")
    except Exception as e:
        print(f"Error processing {input_path}: {e}")

if __name__ == '__main__':
    process_image('public/male_hero_delivery.png', 'public/male_hero_delivery_transparent.png')
    process_image('public/female_hero_delivery.png', 'public/female_hero_delivery_transparent.png')
