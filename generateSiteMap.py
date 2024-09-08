import argparse
import re
import os

# Function to extract routes from the router.jsx file
def extract_routes(file_content):
    # Regular expressions to find paths in the router configuration
    path_pattern = re.compile(r'path:\s*(.*)')
    
    # Extract routes from the main array
    routes = path_pattern.findall(file_content)
    
    
    for match in routes:
        nested_routes = path_pattern.findall(match)
        routes.extend(nested_routes)
    
    return routes

# Function to generate the sitemap.xml content
def generate_sitemap(domain, routes):
    sitemap_content = '<?xml version="1.0" encoding="UTF-8"?>\n'
    sitemap_content += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    
    for route in routes:
        route=route.replace('"','')
        route=route.replace("'",'')
        route=route.replace("/",'')
        sitemap_content += f'  <url>\n'
        sitemap_content += f'    <loc>{domain}/{route}</loc>\n'
        sitemap_content += f'    <changefreq>weekly</changefreq>\n'
        sitemap_content += f'    <priority>0.8</priority>\n'
        sitemap_content += f'  </url>\n'

    sitemap_content += '</urlset>'
    return sitemap_content

# Main function to handle argument parsing and file operations
def main():
    # Command-line arguments
    parser = argparse.ArgumentParser(description="Generate sitemap.xml from a React Router configuration")
    
    # Adding both short and long arguments
    parser.add_argument('-f', '--router-file', type=str, required=True, help='Path to the router.jsx file')
    parser.add_argument('-d', '--domain', type=str, default='https://utility.rajlabs.in', help='Domain name for the sitemap')
    parser.add_argument('-o', '--output-file', type=str, default='./public/sitemap.xml', help='Path to output the sitemap.xml')

    args = parser.parse_args()

    # Step 1: Validate router file
    if not os.path.isfile(args.router_file):
        print(f"Error: The file {args.router_file} does not exist.")
        return

    print(f"Reading routes from {args.router_file}...")

    # Step 2: Read the content of the router.jsx file
    with open(args.router_file, 'r') as file:
        file_content = file.read()

    # Step 3: Extract routes
    print("Extracting routes from file...")
    routes = extract_routes(file_content)
    
    # Logging the number of routes found
    num_routes = len(routes)
    if num_routes == 0:
        print("No routes found in the file.")
        return
    
    print(f"Total routes found: {num_routes}")
    print("Extracted routes:")
    for route in routes:
        print(f"  - {route}")

    # Step 4: Generate sitemap.xml content
    print(f"Generating sitemap.xml for domain {args.domain}...")
    sitemap_content = generate_sitemap(args.domain, routes)

    # Step 5: Ensure output directory exists
    output_dir = os.path.dirname(args.output_file)
    if not os.path.exists(output_dir):
        print(f"Creating directory {output_dir}...")
        os.makedirs(output_dir)

    # Step 6: Write the sitemap to the output file
    print(f"Writing sitemap to {args.output_file}...")
    with open(args.output_file, 'w') as output_file:
        output_file.write(sitemap_content)

    # Print the full path of the generated sitemap.xml file
    absolute_output_path = os.path.abspath(args.output_file)
    print(f"Sitemap generation completed. The file has been saved to: {absolute_output_path}")

# Entry point
if __name__ == "__main__":
    main()
