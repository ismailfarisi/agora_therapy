import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { FiClock, FiUser, FiTag } from 'react-icons/fi';

export const metadata: Metadata = {
  title: 'Mental Health Blog | MindGood',
  description: 'Explore articles on mental health topics written by our expert psychologists in multiple languages including Malayalam, Tamil, Hindi, Telugu, and Kannada.',
  keywords: 'mental health blog, psychology articles, multilingual mental health resources, Indian languages',
};

// Mock blog data - in a real app, this would come from a CMS or API
const blogPosts = [
  {
    id: 'managing-workplace-stress',
    title: 'Managing Workplace Stress in the Modern Era',
    excerpt: 'Learn effective strategies to handle workplace stress and maintain a healthy work-life balance in today\'s fast-paced professional environment.',
    image: '/images/blog/workplace-stress.jpg',
    date: 'July 10, 2025',
    author: 'Dr. Priya Sharma',
    authorImage: '/images/psychologists/priya-sharma.jpg',
    category: 'Job Stress',
    readTime: '5 min read',
    languages: ['English', 'Hindi']
  },
  {
    id: 'understanding-anxiety',
    title: 'Understanding Anxiety: Signs, Symptoms, and Support',
    excerpt: 'Recognize the common signs of anxiety disorders and discover coping mechanisms that can help manage symptoms and improve quality of life.',
    image: '/images/blog/anxiety.jpg',
    date: 'July 5, 2025',
    author: 'Dr. Anand Kumar',
    authorImage: '/images/psychologists/anand-kumar.jpg',
    category: 'Anxiety',
    readTime: '7 min read',
    languages: ['English', 'Malayalam', 'Tamil']
  },
  {
    id: 'parenting-challenges',
    title: 'Navigating Parenting Challenges in the Digital Age',
    excerpt: 'Explore strategies for effective parenting in an era dominated by technology and social media, while fostering healthy family relationships.',
    image: '/images/blog/parenting.jpg',
    date: 'June 28, 2025',
    author: 'Dr. Lakshmi Nair',
    authorImage: '/images/psychologists/lakshmi-nair.jpg',
    category: 'Family Orientation',
    readTime: '6 min read',
    languages: ['English', 'Malayalam', 'Kannada']
  },
  {
    id: 'supporting-learning-disabilities',
    title: 'Supporting Children with Learning Disabilities: A Guide for Parents',
    excerpt: 'Practical advice for parents to help children with dyslexia, ADHD, and other learning disabilities thrive academically and socially.',
    image: '/images/blog/learning-disabilities.jpg',
    date: 'June 20, 2025',
    author: 'Dr. Rajesh Menon',
    authorImage: '/images/psychologists/rajesh-menon.jpg',
    category: 'Learning Disabilities',
    readTime: '8 min read',
    languages: ['English', 'Tamil', 'Telugu']
  },
  {
    id: 'career-transitions',
    title: 'Navigating Career Transitions with Confidence',
    excerpt: 'Strategies to manage the psychological aspects of career changes, from handling uncertainty to building resilience during professional transitions.',
    image: '/images/blog/career-transitions.jpg',
    date: 'June 15, 2025',
    author: 'Dr. Vikram Desai',
    authorImage: '/images/psychologists/vikram-desai.jpg',
    category: 'Career Building',
    readTime: '5 min read',
    languages: ['English', 'Hindi', 'Kannada']
  },
  {
    id: 'mindfulness-practices',
    title: 'Mindfulness Practices for Daily Mental Wellness',
    excerpt: 'Simple mindfulness techniques that can be incorporated into your daily routine to reduce stress, improve focus, and enhance overall mental wellbeing.',
    image: '/images/blog/mindfulness.jpg',
    date: 'June 8, 2025',
    author: 'Dr. Meena Krishnan',
    authorImage: '/images/psychologists/meena-krishnan.jpg',
    category: 'Anxiety',
    readTime: '4 min read',
    languages: ['English', 'Tamil', 'Telugu', 'Malayalam']
  }
];

export default function BlogPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Mental Health Blog</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
          Expert insights, tips, and resources on mental health topics in multiple languages.
        </p>
      </div>
      
      {/* Featured Post */}
      <div className="mb-16">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="relative h-64 md:h-auto">
              <Image 
                src={blogPosts[0].image} 
                alt={blogPosts[0].title}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-8">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-3">
                <FiClock className="mr-1" />
                <span className="mr-4">{blogPosts[0].date}</span>
                <FiUser className="mr-1" />
                <span>{blogPosts[0].author}</span>
              </div>
              
              <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                {blogPosts[0].title}
              </h2>
              
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {blogPosts[0].excerpt}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="inline-flex items-center text-xs px-2 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300 rounded-full">
                  <FiTag className="mr-1" /> {blogPosts[0].category}
                </span>
                {blogPosts[0].languages.map((lang) => (
                  <span 
                    key={lang}
                    className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full"
                  >
                    {lang}
                  </span>
                ))}
              </div>
              
              <Link 
                href={`/blog/${blogPosts[0].id}`}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-md hover:opacity-90 transition-opacity"
              >
                Read Full Article
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Blog Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogPosts.slice(1).map((post) => (
          <div 
            key={post.id}
            className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="relative h-48">
              <Image 
                src={post.image} 
                alt={post.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-6">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-3">
                <FiClock className="mr-1" />
                <span className="mr-3">{post.readTime}</span>
                <span>{post.date}</span>
              </div>
              
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                {post.title}
              </h3>
              
              <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
                {post.excerpt}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="inline-flex items-center text-xs px-2 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300 rounded-full">
                  <FiTag className="mr-1" /> {post.category}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden mr-2">
                    <Image 
                      src={post.authorImage} 
                      alt={post.author}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{post.author}</span>
                </div>
                
                <div className="flex gap-1">
                  {post.languages.slice(0, 2).map((lang) => (
                    <span 
                      key={lang}
                      className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full"
                    >
                      {lang}
                    </span>
                  ))}
                  {post.languages.length > 2 && (
                    <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full">
                      +{post.languages.length - 2}
                    </span>
                  )}
                </div>
              </div>
              
              <Link 
                href={`/blog/${post.id}`}
                className="block w-full mt-4 py-2 text-center text-teal-600 dark:text-teal-400 border border-teal-600 dark:border-teal-400 rounded-md hover:bg-teal-50 dark:hover:bg-teal-900/10 transition-colors"
              >
                Read Article
              </Link>
            </div>
          </div>
        ))}
      </div>
      
      {/* Newsletter Signup */}
      <div className="mt-16 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl p-8 md:p-12 text-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-4">Subscribe to Our Newsletter</h2>
            <p className="opacity-90">
              Get the latest mental health resources, tips, and articles delivered directly to your inbox.
            </p>
          </div>
          
          <form className="flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-4 py-3 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <select className="px-4 py-3 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-white">
              <option value="en">English</option>
              <option value="ml">Malayalam</option>
              <option value="ta">Tamil</option>
              <option value="hi">Hindi</option>
              <option value="te">Telugu</option>
              <option value="kn">Kannada</option>
            </select>
            <button
              type="submit"
              className="px-6 py-3 bg-white text-teal-600 font-medium rounded-md hover:bg-gray-100 transition-colors"
            >
              Subscribe
            </button>
          </form>
          
          <p className="text-sm text-center mt-4 opacity-80">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </div>
    </div>
  );
}
