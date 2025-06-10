import os
import html
import re
import json
import time
from datetime import datetime
from collections import defaultdict

def get_skip_markdown_files(file_path):
    '''得到不处理的文件的集合'''
    skip_files = set()
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            for line in f:
                filename = line.strip()
                if filename:
                    skip_files.add(filename)
    except Exception as e:
        print(f"读取文件 {file_path} 时出错: {e}")
    return skip_files

def check_markdown_content(content):
    '''v-pre检测，只包裹正文内容，不影响 frontmatter'''  
    if content.startswith('::: v-pre') and content.rstrip().endswith(':::'):
        return content
    # 如果存在 frontmatter，则分离 header 和 body
    if content.startswith('---'):
        parts = content.split('---\n', 2)
        if len(parts) >= 3:
            header = '---\n' + parts[1] + '\n---\n'
            body = parts[2]
            return header + '::: v-pre\n' + body + '\n:::'
    # 无 frontmatter，直接包裹全部
    return f'::: v-pre\n{content}\n:::'

def replace_html_entities(content):
    '''替换字符串中的HTML实体为对应的普通字符'''
    try:
        return html.unescape(content)
    except Exception as e:
        print(f"替换HTML实体时出错: {e}")
        return content

def convert_img_tags_to_markdown(content):
    '''将Markdown内容中的HTML <img> 标签替换为Markdown图片语法'''
    try:
        img_tag_pattern = re.compile(r'<img\s+[^>]*>', re.IGNORECASE)
        def replace_img_tag(match):
            img_tag = match.group()
            src_match = re.search(r'src=["\'](.*?)["\']', img_tag, re.IGNORECASE)
            src = src_match.group(1) if src_match else ''
            alt_match = re.search(r'alt=["\'](.*?)["\']', img_tag, re.IGNORECASE)
            alt = alt_match.group(1) if alt_match else ''
            return f'![{alt}]({src})'
        return img_tag_pattern.sub(replace_img_tag, content)
    except Exception as e:
        print(f"转换过程中出错: {e}")
        return content

def extract_frontmatter(content):
    '''提取文章的frontmatter元数据'''
    frontmatter_pattern = r'^---\n(.*?)\n---'
    match = re.match(frontmatter_pattern, content, re.DOTALL)
    
    metadata = {}
    if match:
        frontmatter_content = match.group(1)
        for line in frontmatter_content.split('\n'):
            if ':' in line:
                key, value = line.split(':', 1)
                metadata[key.strip()] = value.strip().strip('"\'')
    
    return metadata

def generate_excerpt(content, max_length=150):
    '''生成文章摘要'''
    content = re.sub(r'^---\n.*?\n---\n', '', content, flags=re.DOTALL)
    content = re.sub(r'[#*`_\[\]()]', '', content)
    content = re.sub(r'!\[.*?\]\(.*?\)', '', content)
    content = re.sub(r'\s+', ' ', content).strip()
    
    if len(content) <= max_length:
        return content
    
    truncated = content[:max_length]
    last_sentence_end = max(
        truncated.rfind('。'),
        truncated.rfind('！'),
        truncated.rfind('？'),
        truncated.rfind('.'),
        truncated.rfind('!'),
        truncated.rfind('?')
    )
    
    if last_sentence_end > max_length * 0.7:
        return truncated[:last_sentence_end + 1]
    
    return truncated + '...'

def estimate_reading_time(content):
    '''估算阅读时间'''
    chinese_chars = len(re.findall(r'[\u4e00-\u9fff]', content))
    english_words = len(re.findall(r'\b[a-zA-Z]+\b', content))
    reading_time = (chinese_chars / 300) + (english_words / 200)
    return max(1, round(reading_time))

def get_file_stats(file_path):
    '''获取文件统计信息'''
    try:
        stat = os.stat(file_path)
        return {
            'created': datetime.fromtimestamp(stat.st_ctime),
            'modified': datetime.fromtimestamp(stat.st_mtime),
            'size': stat.st_size
        }
    except:
        return {
            'created': datetime.now(),
            'modified': datetime.now(),
            'size': 0
        }

def get_category_from_path(path):
    '''从文件路径推断分类'''
    if '笔记' in path:
        return '学习笔记'
    elif '想法' in path:
        return '随想感悟'
    elif 'about' in path.lower():
        return '关于'
    elif 'friend' in path.lower():
        return '友链'
    else:
        return '其他'

# 全局变量
actions = ""
themes = ['brand', 'alt']
articles_data = []

def process_markdown_files(directory_path, skip_files):
    '''处理Markdown文件'''
    global actions, articles_data
    try:
        for root, dirs, files in os.walk(directory_path):
            for file in files:
                if file.endswith('.md') and file not in skip_files:
                    file_path = os.path.join(root, file)
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            content = f.read()
                        
                        # 提取元数据
                        metadata = extract_frontmatter(content)
                        file_stats = get_file_stats(file_path)
                        
                        # 生成相对路径
                        relative_path = os.path.relpath(file_path, directory_path).replace('\\', '/')
                        if not relative_path.startswith('/'):
                            relative_path = '/' + relative_path
                        # 去除 .md 后缀，用于链接和 metadata
                        link_path = relative_path[:-3] if relative_path.lower().endswith('.md') else relative_path
                        
                        # 生成文章数据
                        tags = metadata.get('tags', [])
                        if isinstance(tags, str):
                            tags = [tag.strip() for tag in tags.split(',') if tag.strip()]
                        
                        article_data = {
                            'title': metadata.get('title', os.path.splitext(file)[0]),
                            'path': link_path,
                            'category': metadata.get('category', get_category_from_path(relative_path)),
                            'author': metadata.get('author', 'YuanQiiii'),
                            'excerpt': metadata.get('description', generate_excerpt(content)),
                            'tags': tags,
                            'created': metadata.get('date', file_stats['created'].isoformat()),
                            'modified': file_stats['modified'].isoformat(),
                            'reading_time': estimate_reading_time(content),
                            'word_count': len(re.findall(r'[\u4e00-\u9fff]', content)) + len(re.findall(r'\b[a-zA-Z]+\b', content))
                        }
                        articles_data.append(article_data)
                        
                        # 处理内容
                        content = convert_img_tags_to_markdown(content)
                        content = replace_html_entities(content)
                        content = check_markdown_content(content)
                        
                        # 写回文件
                        with open(file_path, 'w', encoding='utf-8') as f:
                            f.write(content)
                        
                        print(f"处理文件: {file_path}")
                        
                        # 生成actions内容
                        file_name = os.path.splitext(file)[0]
                        theme = themes[len(actions.split('\n')) % len(themes)]
                        new_content = f'    - theme: {theme}\n      text: {file_name}\n      link: {link_path}\n'
                        actions += new_content

                    except Exception as e:
                        print(f"处理文件 {file_path} 时出错: {e}")
                        
    except Exception as e:
        print(f"遍历目录 {directory_path} 时出错: {e}")

def process_action_file():
    '''处理action文件'''
    actions_target_file = os.path.join('core', 'note', 'list.md')
    try:
        if not os.path.exists(actions_target_file):
            print(f'目标文件未找到: {actions_target_file}')
            return
            
        with open(actions_target_file, 'r', encoding='utf-8') as file:
            data = file.read()
            
        actions_index = data.find('actions:')
        if actions_index == -1:
            print(f'在文件 {actions_target_file} 中未找到 actions: 标记')
            return
            
        header = data[:actions_index + len('actions:')]
        updated_content = f'{header}\n{actions}\n---'
        
        with open(actions_target_file, 'w', encoding='utf-8') as file:
            file.write(updated_content)
            
        print('Actions 更新成功')
    except Exception as e:
        print(f'处理文件时出错: {e}')

def get_items(dir_path, base_path=''):
    '''生成侧边栏项目'''
    items = []
    try:
        entries = os.listdir(dir_path)
        for entry in entries:
            full_path = os.path.join(dir_path, entry)
            if os.path.isdir(full_path):
                sub_items = get_items(full_path, os.path.join(base_path, entry).replace(os.sep, '/'))
                if sub_items:
                    items.append({
                        'text': entry,
                        'collapsed': False,
                        'items': sub_items
                    })
            elif os.path.isfile(full_path) and entry.endswith('.md'):
                name = entry
                if name.lower() not in skip_list:
                    raw_link = os.path.join('/', base_path, name).replace(os.sep, '/')
                    link = raw_link[:-3] if raw_link.lower().endswith('.md') else raw_link
                    items.append({
                        'text': name,
                        'link': link
                    })
    except Exception as e:
        print(f"生成侧边栏项目时出错: {e}")
    return items

def generate_sidebar():
    '''生成侧边栏'''
    docs_dir = os.path.join(os.path.dirname(__file__), 'core')
    sidebar_items_file = os.path.join(docs_dir, '.vitepress', 'sidebarItems.js')
    
    sidebar_items = get_items(docs_dir)
    
    sidebar_code = f"""// 此文件由 preprocess 自动生成，请勿手动修改
export default {json.dumps(sidebar_items, ensure_ascii=False, indent=2)};
"""
    
    vitepress_dir = os.path.join(docs_dir, '.vitepress')
    if not os.path.exists(vitepress_dir):
        os.makedirs(vitepress_dir)
    
    with open(sidebar_items_file, 'w', encoding='utf-8') as f:
        f.write(sidebar_code)
    
    print('sidebarItems.js 生成成功')

def generate_articles_data():
    '''生成文章数据文件'''
    docs_dir = os.path.join(os.path.dirname(__file__), 'core')
    articles_data_file = os.path.join(docs_dir, '.vitepress', 'articlesData.js')
    
    sorted_articles = sorted(articles_data, key=lambda x: x['modified'], reverse=True)
    
    articles_code = f"""// 此文件由 preprocess 自动生成，请勿手动修改
export default {json.dumps(sorted_articles, ensure_ascii=False, indent=2)};
"""
    
    vitepress_dir = os.path.join(docs_dir, '.vitepress')
    if not os.path.exists(vitepress_dir):
        os.makedirs(vitepress_dir)
    
    with open(articles_data_file, 'w', encoding='utf-8') as f:
        f.write(articles_code)
    
    print('articlesData.js 生成成功')

def generate_sitemap():
    '''生成站点地图'''
    docs_dir = os.path.join(os.path.dirname(__file__), 'core')
    public_dir = os.path.join(docs_dir, 'public')
    if not os.path.exists(public_dir):
        os.makedirs(public_dir)
    
    sitemap_file = os.path.join(public_dir, 'sitemap.xml')
    base_url = "https://yuanqiiii.github.io"
    
    sitemap_content = '''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
'''
    
    # 添加首页
    sitemap_content += f'''  <url>
    <loc>{base_url}/</loc>
    <lastmod>{datetime.now().strftime('%Y-%m-%d')}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
'''
    
    # 添加文章页面
    for article in articles_data:
        try:
            modified_date = datetime.fromisoformat(article['modified'].replace('Z', '+00:00')).strftime('%Y-%m-%d')
        except:
            modified_date = datetime.now().strftime('%Y-%m-%d')
            
        sitemap_content += f'''  <url>
    <loc>{base_url}{article['path']}</loc>
    <lastmod>{modified_date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
'''
    
    sitemap_content += '</urlset>'
    
    with open(sitemap_file, 'w', encoding='utf-8') as f:
        f.write(sitemap_content)
    
    print('sitemap.xml 生成成功')

def compress_images():
    '''压缩图片文件'''
    try:
        from PIL import Image
        
        docs_dir = os.path.join(os.path.dirname(__file__), 'core')
        
        for root, dirs, files in os.walk(docs_dir):
            for file in files:
                if file.lower().endswith(('.jpg', '.jpeg', '.png')):
                    file_path = os.path.join(root, file)
                    try:
                        with Image.open(file_path) as img:
                            if img.width > 1200:
                                ratio = 1200 / img.width
                                new_height = int(img.height * ratio)
                                img = img.resize((1200, new_height), Image.Resampling.LANCZOS)
                                
                                if file.lower().endswith('.png'):
                                    img.save(file_path, 'PNG', optimize=True)
                                else:
                                    img.save(file_path, 'JPEG', quality=85, optimize=True)
                                
                                print(f"已压缩图片: {file_path}")
                    except Exception as e:
                        print(f"压缩图片 {file_path} 时出错: {e}")
                        
    except ImportError:
        print("未安装 Pillow 库，跳过图片压缩")
    except Exception as e:
        print(f"图片压缩过程中出错: {e}")

if __name__ == "__main__":
    try:
        directory = 'core'
        skip_list = get_skip_markdown_files('skip_list.txt')
        
        print("开始预处理...")
        process_markdown_files(directory, skip_list)
        process_action_file()
        # generate_sidebar()  # 不再生成旧的侧边栏
        generate_articles_data()
        generate_sitemap()
        compress_images()
        print('文档预处理完成')
        
    except Exception as e:
        print(f"预处理过程中出现错误: {e}")
        import traceback
        traceback.print_exc()
