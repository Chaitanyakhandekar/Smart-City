import React from 'react';
import { X, Home, Search, PenTool, Edit3, BookOpen, Bookmark, User, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function FeedSidebar({
  activePage = "all",
  sidebarOpen = true,
  setSidebarOpen = () => {}
}) {
  const navigate = useNavigate();

  // Using Lucide icons instead of emojis for consistency
  const menuItems = [
    { id: "all", icon: Home, label: "All Blogs", route: "/user/feed" },
    { id: "search", icon: Search, label: "Search", route: "/user/search" },
    { id: "create", icon: PenTool, label: "Write Blog", route: "/user/blogs/create" },
    { id: "update", icon: Edit3, label: "Update Blog", route: "/user/blogs/update"},
    { id: "my-blogs", icon: BookOpen, label: "My Blogs", route: "/user/blogs" },
    { id: "saved", icon: Bookmark, label: "Saved Blogs", route: "/user/saved-blogs" },
    { id: "profile", icon: User, label: "Profile", route: "/user/profile" }
  ];

  return (
    <aside className={`
      fixed top-0 left-0 h-screen w-72 z-50 
      bg-white dark:bg-[#1f2937]
      border-r border-gray-200 dark:border-gray-800
      transform transition-transform duration-300 ease-in-out
      ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      md:translate-x-0
      shadow-xl
      flex flex-col
    `}>
      {/* Sidebar Header */}
      <div className="relative px-6 py-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 flex justify-center items-center bg-gradient-to-br from-blue-600 to-purple-600 text-white font-mono font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              {'<>'}
            </div>
            <div>
              <h1 className='font-bold text-xl text-gray-900 dark:text-white tracking-tight'>DevMark</h1>
              <p className='text-xs text-gray-500 dark:text-gray-400 font-medium'>Create & Share</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-600 dark:text-gray-400"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const isActive = activePage === item.id;
            const Icon = item.icon;
            
            return (
              <button
                type="button"
                key={item.id}
                onClick={(e) => {
                  e.preventDefault();
                  if(item.route){
                    navigate(item.route);
                  }
                }}
                className={`
                  ${activePage !== "update" && item.id === "update" ? "hidden" : ""}
                  group relative flex items-center gap-3 px-4 py-3 rounded-xl
                  transition-all duration-300 ease-out text-left w-full
                  ${isActive 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25 scale-[1.02]' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:scale-[1.01]'
                  }
                `}
              >
                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full shadow-lg"></div>
                )}
                
                {/* Icon */}
                <div className={`
                  ${isActive ? 'text-white' : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'}
                  transition-colors duration-300
                `}>
                  <Icon size={20} strokeWidth={2} />
                </div>
                
                {/* Label */}
                <span className={`
                  font-semibold text-sm flex-1
                  ${isActive ? 'text-white' : ''}
                `}>
                  {item.label}
                </span>

                {/* Highlight Badge for Create */}
                {item.highlight && !isActive && (
                  <span className="ml-auto flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                  </span>
                )}

                {/* Hover Effect Overlay */}
                {!isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 to-purple-600/0 group-hover:from-blue-600/5 group-hover:to-purple-600/5 rounded-xl transition-all duration-300"></div>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Sidebar Footer - Pro Tip Card */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200/50 dark:border-blue-700/30 rounded-xl p-4 group hover:shadow-lg transition-all duration-300">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Content */}
          <div className="relative">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
              <Sparkles size={16} className="animate-pulse" />
              <p className="text-xs font-bold uppercase tracking-wide">Pro Tip</p>
            </div>
            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
              Use markdown formatting to create rich, engaging blog posts with headers, lists, and code blocks!
            </p>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-400/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-purple-400/10 rounded-full blur-2xl"></div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        aside::-webkit-scrollbar {
          width: 6px;
        }
        aside::-webkit-scrollbar-track {
          background: transparent;
        }
        aside::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #4777f4 0%, #9035ea 100%);
          border-radius: 10px;
        }
        aside::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #5887ff 0%, #a045fa 100%);
        }
      `}</style>
    </aside>
  );
}

export default FeedSidebar;