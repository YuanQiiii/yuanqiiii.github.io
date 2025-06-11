#!/bin/bash

# YuanQiiii 静态网站构建脚本

echo "🚀 开始构建 YuanQiiii 静态网站..."

# 检查依赖
if ! command -v npm &> /dev/null; then
    echo "❌ 错误: npm 未安装"
    exit 1
fi

if ! command -v python3 &> /dev/null; then
    echo "❌ 错误: python3 未安装"
    exit 1
fi

# 清理旧的构建产物和缓存
echo "🧹 清理旧的构建产物和缓存..."
npm run clean

# 安装依赖
echo "📦 安装依赖..."
npm install

# 运行预处理脚本
echo "🔧 运行预处理脚本..."
python3 preprocess.py

# 构建网站
echo "🏗️  构建网站..."
npm run docs:build

# 检查构建结果
if [ -d "core/.vitepress/dist" ]; then
    echo "✅ 构建成功！"
    echo "📁 构建文件位于: core/.vitepress/dist"
    
    # 显示构建统计
    echo "📊 构建统计:"
    echo "   文件数量: $(find core/.vitepress/dist -type f | wc -l)"
    echo "   总大小: $(du -sh core/.vitepress/dist | cut -f1)"
    
    # 检查重要文件
    echo "🔍 检查重要文件:"
    [ -f "core/.vitepress/dist/index.html" ] && echo "   ✅ index.html"
    [ -f "core/.vitepress/dist/sitemap.xml" ] && echo "   ✅ sitemap.xml"
    
else
    echo "❌ 构建失败！"
    exit 1
fi

echo "🎉 构建完成！"
