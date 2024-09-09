import argparse
import re
import os

def extract_routes(file_content):
    path_pattern = re.compile(r'path:\s*(\S+)')
    routes = path_pattern.findall(file_content)
    
    for match in routes:
        nested_routes = path_pattern.findall(match)
        routes.extend(nested_routes)
    
    return routes

def generate_sitemap(domain, routes):
    sitemap_content = '<?xml version="1.0" encoding="UTF-8"?>\n'
    sitemap_content += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    
    for route in routes:
        # Remove unnecessary quotes and extra slashes from the route
        route = route.strip().strip('"').strip("'").strip(",")
        if not route.startswith('/'):
            route = '/' + route
        
        sitemap_content += '  <url>\n'
        sitemap_content += f'    <loc>{domain}{route}</loc>\n'
        sitemap_content += '    <changefreq>weekly</changefreq>\n'
        sitemap_content += '    <priority>0.8</priority>\n'
        sitemap_content += '  </url>\n'
        # print(sitemap_content)
        # input(" ")
    sitemap_content += '</urlset>'
    return sitemap_content

def main():
    parser = argparse.ArgumentParser(description="Generate sitemap.xml from a React Router configuration")
    
    parser.add_argument('-f', '--router-file', type=str, required=True, help='Path to the router.jsx file')
    parser.add_argument('-d', '--domain', type=str, default='https://utility.rajlabs.in', help='Domain name for the sitemap')
    parser.add_argument('-o', '--output-file', type=str, default='./public/sitemap.xml', help='Path to output the sitemap.xml')

    args = parser.parse_args()

    if not os.path.isfile(args.router_file):
        print(f"Error: The file {args.router_file} does not exist.")
        return

    print(f"Reading routes from {args.router_file}...")

    with open(args.router_file, 'r') as file:
        file_content = file.read()

    print("Extracting routes from file...")
    routes = extract_routes(file_content)
    
    num_routes = len(routes)
    if num_routes == 0:
        print("No routes found in the file.")
        return
    
    print(f"Total routes found: {num_routes}")
    print("Extracted routes:")
    for route in routes:
        print(f"  - {route}")

    hostnames = [args.domain, 'https://utils.rajlabs.in']

    for i, hostname in enumerate(hostnames):
        print(f"Generating sitemap{i}.xml for domain {hostname}...")
        sitemap_content = generate_sitemap(hostname, routes)

        output_file = f'./public/sitemap{i}.xml' if i!=0 else './public/sitemap.xml'
        print(f"Writing sitemap{i} to {output_file}...")
        with open(output_file, 'w') as file:
            file.write(sitemap_content)

        absolute_output_path = os.path.abspath(output_file)
        print(f"Sitemap{i} generation completed. The file has been saved to: {absolute_output_path}")

if __name__ == "__main__":
    main()
