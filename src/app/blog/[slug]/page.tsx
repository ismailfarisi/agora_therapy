'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FiClock, FiUser, FiTag, FiShare2, FiArrowLeft } from 'react-icons/fi';
import { getBlogPostBySlug, getRelatedPosts } from '@/lib/data/blogPosts';
import { useLanguage } from '@/lib/utils/language-context';

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const blogPost = getBlogPostBySlug(slug);
  const { currentLanguage } = useLanguage();
  
  const [selectedLanguage, setSelectedLanguage] = useState(
    blogPost?.languages.includes(currentLanguage === 'en' ? 'English' : 
      currentLanguage === 'ml' ? 'Malayalam' : 
      currentLanguage === 'ta' ? 'Tamil' : 
      currentLanguage === 'hi' ? 'Hindi' : 
      currentLanguage === 'te' ? 'Telugu' : 
      currentLanguage === 'kn' ? 'Kannada' : 'English') 
      ? (currentLanguage === 'en' ? 'English' : 
         currentLanguage === 'ml' ? 'Malayalam' : 
         currentLanguage === 'ta' ? 'Tamil' : 
         currentLanguage === 'hi' ? 'Hindi' : 
         currentLanguage === 'te' ? 'Telugu' : 
         currentLanguage === 'kn' ? 'Kannada' : 'English')
      : blogPost?.languages[0] || 'English'
  );
  
  // Get related posts based on the same category
  const relatedPosts = blogPost ? getRelatedPosts(slug, blogPost.category, 3) : [];
  
  if (!blogPost) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Blog Post Not Found</h1>
        <p className="mb-8">The blog post you are looking for does not exist or has been removed.</p>
        <Link 
          href="/blog"
          className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-teal-500 to-blue-600 text-white font-medium hover:opacity-90 transition-opacity"
        >
          <FiArrowLeft className="mr-2" /> Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Back Button */}
      <Link 
        href="/blog"
        className="inline-flex items-center text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 mb-8"
      >
        <FiArrowLeft className="mr-2" /> Back to Blog
      </Link>
      
      <div className="max-w-4xl mx-auto">
        {/* Blog Header */}
        <div className="mb-8">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-3">
            <FiClock className="mr-1" />
            <span className="mr-4">{blogPost.date}</span>
            <FiUser className="mr-1" />
            <span>{blogPost.author}</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
            {blogPost.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center">
              <span className="inline-flex items-center text-sm px-3 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300 rounded-full">
                <FiTag className="mr-1" /> {blogPost.category}
              </span>
            </div>
            
            {/* Language Selector */}
            {blogPost.languages.length > 1 && (
              <div className="flex items-center">
                <span className="text-sm text-gray-700 dark:text-gray-300 mr-2">Available in:</span>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="text-sm px-2 py-1 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  {blogPost.languages.map((lang) => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>
            )}
            
            {/* Share Button */}
            <button className="ml-auto inline-flex items-center text-sm px-3 py-1 border border-gray-300 dark:border-gray-700 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <FiShare2 className="mr-1" /> Share
            </button>
          </div>
        </div>
        
        {/* Featured Image */}
        <div className="relative h-80 md:h-96 rounded-lg overflow-hidden mb-8">
          <Image 
            src={blogPost.image} 
            alt={blogPost.title}
            fill
            className="object-cover"
            priority
          />
        </div>
        
        {/* Author Info */}
        <div className="flex items-center mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4">
            <Image 
              src={blogPost.authorImage} 
              alt={blogPost.author}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{blogPost.author}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{blogPost.readTime}</p>
          </div>
        </div>
        
        {/* Blog Content */}
        <div 
          className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-a:text-teal-600 dark:prose-a:text-teal-400 mb-12"
          dangerouslySetInnerHTML={{ __html: blogPost.content }}
        />
        
        {/* Tags */}
        <div className="border-t border-b border-gray-200 dark:border-gray-800 py-6 mb-12">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-700 dark:text-gray-300 mr-2">Tags:</span>
            <span className="text-sm px-3 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300 rounded-full">
              {blogPost.category}
            </span>
            <span className="text-sm px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full">
              Mental Health
            </span>
            <span className="text-sm px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full">
              Wellbeing
            </span>
          </div>
        </div>
        
        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Related Articles</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map((post) => (
                <div 
                  key={post.id}
                  className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative h-40">
                    <Image 
                      src={post.image} 
                      alt={post.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {post.date} • {post.readTime}
                    </p>
                    <Link 
                      href={`/blog/${post.id}`}
                      className="text-teal-600 dark:text-teal-400 text-sm font-medium hover:underline"
                    >
                      Read Article
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* CTA */}
        <div className="bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl p-6 text-white text-center">
          <h2 className="text-xl font-bold mb-3">Need Professional Support?</h2>
          <p className="mb-4 opacity-90">
            Connect with our psychologists who specialize in {blogPost.category.toLowerCase()} management.
          </p>
          <Link 
            href={`/psychologists?specialization=${blogPost.category.toLowerCase().replace(' ', '-')}`}
            className="inline-block px-6 py-2 bg-white text-teal-600 rounded-full font-medium hover:bg-gray-100 transition-colors"
          >
            Find a Specialist
          </Link>
        </div>
      </div>
    </div>
  );
}
