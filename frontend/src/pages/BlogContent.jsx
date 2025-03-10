import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Clock, Calendar, User, Share2, Bookmark, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';

const BlogContent = () => {
  const { blogType } = useParams();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [relatedBlogs, setRelatedBlogs] = useState([]);

  // Sample data
  const blogData = {
    'pet-care-tips': {
      title: 'Pet Care Tips: Keeping Your Pet Healthy & Happy',
      author: 'Dr. Jane Smith, Veterinarian',
      date: 'January 5, 2025',
      category: 'Pet Care',
      readTime: '8 min read',
      content: (
        <div>
          <h3 className="text-2xl font-bold mb-4">Introduction</h3>
          <p className="mb-6">
            As pet owners, it's essential to ensure that our furry friends lead a happy and healthy life. Pets bring joy, 
            companionship, and unconditional love to our lives. However, with this responsibility comes the need to ensure that 
            they are well-cared for. Maintaining your pet's health doesn't just mean providing food and water, it also requires 
            proper mental stimulation, exercise, and regular veterinary check-ups. In this article, we'll explore practical 
            tips and advice to help you maintain your pet's well-being throughout the year, no matter their age, size, or breed.
          </p>

          <img src="/api/placeholder/800/500" alt="Healthy Pet" className="w-full h-64 object-cover mb-6 rounded-lg" />

          <h3 className="text-2xl font-bold mb-4">1. Regular Exercise is Key</h3>
          <p className="mb-6">
            Just like humans, pets need regular physical activity to stay healthy. Whether it's a daily walk, playtime in the 
            backyard, or interactive activities like fetch, keeping your pet active is vital for their physical and mental 
            well-being. Exercise helps control weight, improve cardiovascular health, and reduce anxiety. Pet owners should 
            aim to provide their pets with at least 30 minutes of physical activity daily. For younger, high-energy pets, 
            such as puppies or certain breeds like Border Collies, the activity level may need to be higher.
          </p>
          <p className="mb-6">
            Studies have shown that regular exercise can help prevent obesity, which is a common problem in pets, especially 
            in indoor cats and dogs. Additionally, regular exercise boosts endorphins, which improve your pet's mood and reduce 
            stress, providing both physical and emotional benefits.
          </p>
          <p className="mb-6">
            One great way to ensure your pet gets the exercise they need is to incorporate fun activities like agility courses, 
            or even dog yoga (known as 'doga'). These activities not only keep them physically fit but also mentally stimulated.
          </p>

          <h3 className="text-2xl font-bold mb-4">2. A Balanced Diet: Nutrition Matters</h3>
          <p className="mb-6">
            A proper diet is the foundation of your pet's health. Just as humans need a balanced diet to thrive, so do pets. 
            Ensure you're feeding them high-quality pet food suited to their age, breed, and health conditions. For instance, 
            puppies require more protein and fat for growth, while older dogs may benefit from a diet focused on joint health and 
            weight management.
          </p>
          <p className="mb-6">
            Consult your veterinarian for specific dietary recommendations, especially if your pet has any allergies or medical 
            conditions like diabetes, kidney disease, or obesity. Quality pet foods contain the right balance of proteins, fats, 
            vitamins, and minerals to keep your pet in top shape. Remember, treats should be given in moderation to avoid 
            unnecessary weight gain. Opt for healthy treats, such as carrots or apple slices, instead of calorie-laden biscuits.
          </p>
          <p className="mb-6">
            Hydration is just as important as food. Always ensure your pet has access to fresh water, especially if they are on 
            a dry food diet. For cats, adding wet food to their meals can help increase hydration levels.
          </p>

          <h3 className="text-2xl font-bold mb-4">3. Regular Veterinary Checkups</h3>
          <p className="mb-6">
            Preventative care is one of the most important aspects of pet health. Regular checkups with your veterinarian can 
            help catch potential health issues before they become serious. During these visits, your vet will perform physical 
            exams, check for signs of common illnesses, and ensure vaccinations are up to date.
          </p>
          <p className="mb-6">
            Dental health is a common but often overlooked issue in pets. Dental disease can lead to severe problems such as 
            heart disease, kidney disease, and painful tooth infections. Brushing your pet's teeth regularly and providing dental 
            chews can help maintain their oral health. Regular vet visits can also identify any signs of oral disease early on.
          </p>
          <p className="mb-6">
            Depending on your pet's age, your veterinarian may recommend additional screenings, such as blood tests, to detect 
            underlying health issues. Early detection and intervention can lead to better treatment outcomes and a longer, 
            healthier life for your pet.
          </p>

          <h3 className="text-2xl font-bold mb-4">4. Mental Health and Socialization</h3>
          <p className="mb-6">
            Mental health is just as important as physical health for pets. Pet anxiety can affect dogs, cats, and even small 
            mammals. Symptoms of anxiety may include excessive barking, destructive behavior, lethargy, or changes in appetite. 
            Thankfully, pet anxiety is treatable with proper care, including desensitization training, safe spaces, and calming 
            products like pheromone diffusers or anxiety wraps.
          </p>
          <p className="mb-6">
            Socializing your pet is another key aspect of mental health. Exposing your pet to new environments, people, and animals 
            in a controlled and positive way will help them feel more confident and comfortable in a variety of situations. 
            Socialized pets are typically less fearful and better behaved in public settings.
          </p>
          <p className="mb-6">
            Interactive toys, puzzle feeders, and training sessions also provide mental stimulation for your pet, keeping their 
            mind sharp and preventing boredom-induced behavior problems. These activities are especially important for pets 
            who spend a lot of time at home alone.
          </p>

          <h3 className="text-2xl font-bold mb-4">Conclusion</h3>
          <p className="mb-6">
            By following these simple but important tips, you can ensure your pet remains healthy, happy, and well-adjusted. 
            Remember, a happy pet is a lifelong companion! Regular exercise, a balanced diet, veterinary care, and mental 
            stimulation are all key elements in maintaining your pet's quality of life. Your pet depends on you to make the 
            right choices, so take the time to invest in their well-being and enjoy the rewards of a long and fulfilling 
            relationship.
          </p>
        </div>
      ),
      image: '/api/placeholder/800/500',
      tags: ['Pet Health', 'Exercise', 'Nutrition', 'Veterinary Care', 'Mental Health'],
    },
    'latest-veterinary-breakthroughs': {
      title: 'Latest Breakthroughs in Veterinary Medicine',
      author: 'Dr. Michael Turner, Veterinary Researcher',
      date: 'January 4, 2025',
      category: 'Veterinary Medicine',
      readTime: '7 min read',
      content: (
        <div>
          <h3 className="text-2xl font-bold mb-4">Introduction</h3>
          <p className="mb-6">
            Veterinary medicine has come a long way in recent years, with numerous breakthroughs improving the lives of pets 
            and their owners. Advances in technology, treatments, and research have led to better diagnoses, more effective 
            therapies, and improved overall care for pets. In this article, we'll discuss some of the most exciting recent 
            developments in veterinary research and what they mean for your pet's health.
          </p>

          <img src="/api/placeholder/800/500" alt="Veterinary Breakthroughs" className="w-full h-64 object-cover mb-6 rounded-lg" />

          <h3 className="text-2xl font-bold mb-4">1. Gene Therapy for Genetic Diseases</h3>
          <p className="mb-6">
            One of the most promising areas of veterinary medicine is gene therapy. This cutting-edge treatment method 
            involves altering or replacing defective genes that cause inherited diseases in pets. Genetic disorders, such 
            as muscular dystrophy in dogs or inherited blindness, can now be treated using gene therapy techniques. 
            Researchers are exploring the potential of using gene-editing technologies like CRISPR to correct these genetic 
            defects at the DNA level.
          </p>
          <p className="mb-6">
            In some cases, gene therapy has already yielded positive results. For instance, gene therapy has been used to 
            treat dogs suffering from Leber's congenital amaurosis, a form of inherited blindness. The treatment involves 
            injecting a corrected gene into the retina, which can restore some sight. As research progresses, gene therapy 
            may become a routine part of veterinary care for genetic diseases.
          </p>

          <h3 className="text-2xl font-bold mb-4">2. Immunotherapy for Cancer Treatment</h3>
          <p className="mb-6">
            Cancer is one of the leading causes of death in pets, particularly in older animals. While traditional cancer 
            treatments like surgery, chemotherapy, and radiation have been used for years, a new approach called immunotherapy 
            is showing great promise. Immunotherapy works by stimulating the body's immune system to recognize and fight cancer 
            cells more effectively.
          </p>
          <p className="mb-6">
            One breakthrough in veterinary cancer treatment is the development of immune checkpoint inhibitors, which are 
            being tested for use in dogs with cancers like melanoma, lymphoma, and mast cell tumors. These inhibitors help 
            the immune system recognize and attack cancer cells that would otherwise evade detection. Early results have 
            shown that immunotherapy can increase survival rates and quality of life for pets with cancer, offering hope for 
            many owners who would otherwise face limited treatment options.
          </p>
        </div>
      ),
      image: '/api/placeholder/800/500',
      tags: ['Veterinary Medicine', 'Gene Therapy', 'Immunotherapy', 'Research', 'Technology'],
    },
    'pet-industry-trends-2025': {
      title: 'Pet Industry Trends: What to Expect in 2025',
      author: 'Sarah Johnson, Pet Industry Expert',
      date: 'January 3, 2025',
      category: 'Pet Industry',
      readTime: '6 min read',
      content: (
        <div>
          <h3 className="text-2xl font-bold mb-4">Introduction</h3>
          <p className="mb-6">
            The pet industry is constantly evolving, and 2025 promises to bring exciting new trends that will shape the 
            way we care for and interact with our pets. With millions of people around the world embracing pet ownership, 
            the pet industry has become a multi-billion dollar global market. From advancements in pet technology to changes 
            in consumer preferences, several trends are set to dominate the pet care sector in 2025.
          </p>

          <img src="/api/placeholder/800/500" alt="Pet Industry Trends" className="w-full h-64 object-cover mb-6 rounded-lg" />

          <h3 className="text-2xl font-bold mb-4">1. The Rise of Pet Tech</h3>
          <p className="mb-6">
            One of the most significant trends in the pet industry is the growth of pet technology, or pet tech. Innovations 
            in smart devices and wearable technology are revolutionizing pet care. Pet owners now have access to a wide range 
            of gadgets designed to monitor their pets' health, behavior, and environment.
          </p>
        </div>
      ),
      image: '/api/placeholder/800/500',
      tags: ['Pet Industry', 'Trends', 'Pet Tech', 'Sustainability', 'Pet Wellness'],
    },
  };

  // Calculate commentCount from a random number to simulate real comments
  useEffect(() => {
    setCommentCount(Math.floor(Math.random() * 20));
  }, [blogType]);

  // Find related blogs
  useEffect(() => {
    if (blogData[blogType]) {
      const currentTags = blogData[blogType].tags || [];
      
      // Find other blogs with matching tags
      const related = Object.entries(blogData)
        .filter(([key]) => key !== blogType)
        .map(([key, blog]) => {
          const matchingTags = (blog.tags || []).filter(tag => 
            currentTags.includes(tag)
          ).length;
          
          return {
            key,
            blog,
            matchingTags
          };
        })
        .sort((a, b) => b.matchingTags - a.matchingTags)
        .slice(0, 2)
        .map(item => ({
          type: item.key,
          title: item.blog.title,
          image: item.blog.image,
          date: item.blog.date,
          category: item.blog.category
        }));
      
      setRelatedBlogs(related);
    }
  }, [blogType]);

  // Table of contents from headings
  const getTableOfContents = () => {
    if (!blogData[blogType]) return [];
    
    // This is a simplified example - in a real app, you'd parse the actual content
    return [
      { id: 'introduction', title: 'Introduction' },
      { id: 'section-1', title: '1. Regular Exercise is Key' },
      { id: 'section-2', title: '2. A Balanced Diet: Nutrition Matters' },
      { id: 'section-3', title: '3. Regular Veterinary Checkups' },
      { id: 'section-4', title: '4. Mental Health and Socialization' },
      { id: 'conclusion', title: 'Conclusion' }
    ];
  };

  // Share functionality
  const handleShare = () => {
    // In a real app, this would open a share dialog
    alert(`Sharing: ${window.location.href}`);
  };

  // Bookmark functionality
  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  // Scroll to section
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!blogData[blogType]) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-lg">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Blog not found</h2>
          <p className="text-gray-600 mb-6">The requested blog is not available. Please check the URL or try again later.</p>
          <Link to="/" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const { title, author, date, content, image, category, readTime, tags } = blogData[blogType];

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 z-50 bg-gray-200">
        <div className="h-full bg-blue-600" style={{ width: '0%' }} id="reading-progress"></div>
      </div>
      
      <main className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar - Table of Contents */}
          <aside className="hidden lg:block lg:col-span-3 lg:sticky lg:top-24 self-start">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h4 className="font-bold text-gray-900 mb-4">Table of Contents</h4>
              <ul className="space-y-2">
                {getTableOfContents().map((item) => (
                  <li key={item.id}>
                    <button 
                      onClick={() => scrollToSection(item.id)}
                      className="text-gray-600 hover:text-blue-600 text-sm text-left w-full truncate"
                    >
                      {item.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
          
          {/* Main Content */}
          <article className="lg:col-span-9">
            {/* Blog Header */}
            <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {category}
                </span>
                <span className="flex items-center text-gray-500 text-sm">
                  <Clock size={16} className="mr-1" />
                  {readTime}
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                {title}
              </h1>
              
              <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-6 mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{author}</div>
                    <div className="flex items-center text-gray-500 text-sm">
                      <Calendar size={14} className="mr-1" />
                      {date}
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <button 
                    onClick={handleShare}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
                    aria-label="Share article"
                  >
                    <Share2 size={18} />
                  </button>
                  <button 
                    onClick={toggleBookmark}
                    className={`p-2 rounded-full ${isBookmarked ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} transition`}
                    aria-label={isBookmarked ? "Remove bookmark" : "Bookmark article"}
                  >
                    <Bookmark size={18} fill={isBookmarked ? "currentColor" : "none"} />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Featured Image */}
            <div className="relative aspect-video mb-8 rounded-xl overflow-hidden shadow-lg">
              <img 
                src={image} 
                alt={title} 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Content */}
            <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
              <div className="prose prose-lg max-w-none prose-headings:scroll-mt-20">
                {content}
              </div>
              
              {/* Tags */}
              {tags && tags.length > 0 && (
                <div className="mt-8 pt-6 border-t">
                  <h4 className="font-medium text-gray-900 mb-3">Related Topics</h4>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <span key={index} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Author Bio */}
            <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">About the Author</h3>
              <div className="flex flex-wrap md:flex-nowrap gap-6">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center">
                  <User className="text-blue-600" size={28} />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">{author}</h4>
                  <p className="text-gray-600 mb-4">
                    {author.includes("Veterinarian") 
                      ? "Dr. Smith is a certified veterinarian with over 15 years of experience in small animal practice. She specializes in preventative care and nutrition."
                      : author.includes("Researcher")
                        ? "Dr. Turner is a leading researcher in veterinary medicine with a focus on innovative treatments and breakthrough technologies."
                        : "Sarah Johnson has been analyzing pet industry trends for over a decade and has been featured in numerous publications."
                    }
                  </p>
                  <a href="#" className="text-blue-600 hover:text-blue-800 font-medium">View full profile</a>
                </div>
              </div>
            </div>
            
            {/* Comments Section */}
            <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Comments ({commentCount})</h3>
                <button className="text-blue-600 hover:text-blue-800 font-medium">View all</button>
              </div>
              
              <div className="mb-6">
                <div className="flex gap-4 mb-6">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="font-medium text-gray-900 mb-1">Rebecca L.</div>
                      <p className="text-gray-600">This article was incredibly helpful! I've been struggling with my dog's diet and this gave me some great tips to try.</p>
                    </div>
                    <div className="flex gap-4 mt-2 text-sm text-gray-500">
                      <button className="hover:text-blue-600">Like</button>
                      <button className="hover:text-blue-600">Reply</button>
                      <span>3 days ago</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="font-medium text-gray-900 mb-1">Michael T.</div>
                      <p className="text-gray-600">I'd add that puzzle feeders have been amazing for my cat's mental stimulation. Great article overall!</p>
                    </div>
                    <div className="flex gap-4 mt-2 text-sm text-gray-500">
                      <button className="hover:text-blue-600">Like</button>
                      <button className="hover:text-blue-600">Reply</button>
                      <span>1 day ago</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center">
                  <User className="text-blue-600" size={16} />
                </div>
                <div className="flex-1">
                  <textarea 
                    className="w-full border border-gray-300 rounded-lg p-3 h-24 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Add your comment..."
                  ></textarea>
                  <div className="flex justify-end mt-2">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                      Post Comment
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Related Articles */}
            {relatedBlogs.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Related Articles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {relatedBlogs.map((blog, index) => (
                    <Link to={`/blog/${blog.type}`} key={index} className="group">
                      <div className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition">
                        <div className="aspect-video overflow-hidden">
                          <img 
                            src={blog.image} 
                            alt={blog.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                        </div>
                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-medium text-blue-600">{blog.category}</span>
                            <span className="text-xs text-gray-500">{blog.date}</span>
                          </div>
                          <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition line-clamp-2">
                            {blog.title}
                          </h4>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </article>
        </div>
        
        {/* Previous/Next Article Navigation */}
        <div className="max-w-6xl mx-auto px-4 mt-8">
          <div className="flex flex-wrap md:flex-nowrap justify-between gap-4">
            <Link to="#" className="flex items-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition flex-1 max-w-xs">
              <ChevronLeft className="text-gray-400 mr-2" />
              <div className="overflow-hidden">
                <div className="text-sm text-gray-500">Previous Article</div>
                <div className="font-medium text-gray-900 truncate">Understanding Pet Allergies</div>
              </div>
            </Link>
            
            <Link to="#" className="flex items-center justify-end p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition flex-1 max-w-xs">
              <div className="overflow-hidden text-right">
                <div className="text-sm text-gray-500">Next Article</div>
                <div className="font-medium text-gray-900 truncate">Choosing the Right Pet Food</div>
              </div>
              <ChevronRight className="text-gray-400 ml-2" />
            </Link>
          </div>
        </div>
      </main>

      
      <Footer />
      
      {/* Scroll to top button */}
      <button 
        className="fixed bottom-6 right-6 p-3 bg-blue-600 text-white rounded-full shadow-md hover:bg-blue-700 transition opacity-0 invisible"
        id="scroll-to-top"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Scroll to top"
      >
        <ChevronLeft className="transform rotate-90" size={20} />
      </button>
      
      {/* Reading Progress Script */}
      <script dangerouslySetInnerHTML={{
        __html: `
          document.addEventListener('DOMContentLoaded', function() {
            // Reading progress
            window.addEventListener('scroll', function() {
              const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
              const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
              const scrolled = (winScroll / height) * 100;
              document.getElementById('reading-progress').style.width = scrolled + '%';
              
              // Show/hide scroll to top button
              const scrollButton = document.getElementById('scroll-to-top');
              if (winScroll > 300) {
                scrollButton.classList.remove('opacity-0', 'invisible');
                scrollButton.classList.add('opacity-100', 'visible');
              } else {
                scrollButton.classList.add('opacity-0', 'invisible');
                scrollButton.classList.remove('opacity-100', 'visible');
              }
            });
          });
        `
      }} />
    </div>
  );
};

export default BlogContent;