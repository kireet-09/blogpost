// Global variables
let blogs = [];
let currentEditId = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadBlogsFromStorage();
    displayBlogs();
    displayManageBlogs();
    
    // Add some sample data if no blogs exist
    if (blogs.length === 0) {
        addSampleData();
    }
});

// Tab navigation
document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        const targetTab = this.getAttribute('data-tab');
        switchTab(targetTab);
    });
});

function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Update content sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');

    // Refresh manage section when switched to
    if (tabName === 'manage') {
        displayManageBlogs();
    }
}

// Create post form submission
document.getElementById('createForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const newBlog = {
        id: Date.now(),
        title: formData.get('title'),
        category: formData.get('category'),
        content: formData.get('content'),
        author: formData.get('author'),
        date: new Date().toLocaleDateString(),
        timestamp: new Date().toISOString()
    };

    blogs.unshift(newBlog);
    saveBlogsToStorage();
    displayBlogs();
    displayManageBlogs();
    
    // Reset form and show success
    this.reset();
    alert('Post published successfully!');
    switchTab('read');
});

// Edit post form submission
document.getElementById('editForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const blogIndex = blogs.findIndex(blog => blog.id === currentEditId);
    
    if (blogIndex !== -1) {
        blogs[blogIndex] = {
            ...blogs[blogIndex],
            title: formData.get('title'),
            category: formData.get('category'),
            content: formData.get('content'),
            author: formData.get('author')
        };
        
        saveBlogsToStorage();
        displayBlogs();
        displayManageBlogs();
        closeModal('editModal');
        alert('Post updated successfully!');
    }
});

// Search functionality
document.getElementById('searchInput').addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    const filteredBlogs = blogs.filter(blog => 
        blog.title.toLowerCase().includes(searchTerm) ||
        blog.category.toLowerCase().includes(searchTerm) ||
        blog.content.toLowerCase().includes(searchTerm) ||
        blog.author.toLowerCase().includes(searchTerm)
    );
    displayBlogs(filteredBlogs);
});

// Display blogs in read section
function displayBlogs(blogsToShow = blogs) {
    const blogGrid = document.getElementById('blogGrid');
    const emptyState = document.getElementById('emptyState');
    
    if (blogsToShow.length === 0) {
        blogGrid.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    blogGrid.innerHTML = blogsToShow.map(blog => `
        <div class="blog-card">
            <h3>${blog.title}</h3>
            <div class="blog-meta">
                <span class="category-tag">${blog.category}</span>
                <span>${blog.date}</span>
            </div>
            <div class="blog-content">
                ${blog.content.substring(0, 150)}${blog.content.length > 150 ? '...' : ''}
            </div>
            <p style="margin-bottom: 15px; color: #777; font-style: italic;">By ${blog.author}</p>
            <div class="blog-actions">
                <button class="btn btn-small" onclick="readFullPost(${blog.id})">Read Full Post</button>
            </div>
        </div>
    `).join('');
}

// Display blogs in manage section
function displayManageBlogs() {
    const manageGrid = document.getElementById('manageGrid');
    const emptyState = document.getElementById('manageEmptyState');
    
    if (blogs.length === 0) {
        manageGrid.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    manageGrid.innerHTML = blogs.map(blog => `
        <div class="blog-card">
            <h3>${blog.title}</h3>
            <div class="blog-meta">
                <span class="category-tag">${blog.category}</span>
                <span>${blog.date}</span>
            </div>
            <div class="blog-content">
                ${blog.content.substring(0, 100)}${blog.content.length > 100 ? '...' : ''}
            </div>
            <p style="margin-bottom: 15px; color: #777; font-style: italic;">By ${blog.author}</p>
            <div class="blog-actions">
                <button class="btn btn-small" onclick="editPost(${blog.id})">Edit</button>
                <button class="btn btn-small btn-danger" onclick="deletePost(${blog.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

// Read full post
function readFullPost(id) {
    const blog = blogs.find(b => b.id === id);
    if (blog) {
        document.getElementById('modalContent').innerHTML = `
            <h2 style="color: #333; margin-bottom: 15px;">${blog.title}</h2>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #eee;">
                <span class="category-tag">${blog.category}</span>
                <span style="color: #666;">${blog.date}</span>
            </div>
            <div style="line-height: 1.8; color: #444; margin-bottom: 20px; white-space: pre-wrap;">${blog.content}</div>
            <p style="color: #777; font-style: italic; text-align: right;">— ${blog.author}</p>
        `;
        openModal('readModal');
    }
}

// Edit post
function editPost(id) {
    const blog = blogs.find(b => b.id === id);
    if (blog) {
        currentEditId = id;
        document.getElementById('editTitle').value = blog.title;
        document.getElementById('editCategory').value = blog.category;
        document.getElementById('editContent').value = blog.content;
        document.getElementById('editAuthor').value = blog.author;
        openModal('editModal');
    }
}

// Delete post
function deletePost(id) {
    if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
        blogs = blogs.filter(blog => blog.id !== id);
        saveBlogsToStorage();
        displayBlogs();
        displayManageBlogs();
        alert('Post deleted successfully!');
    }
}

// Modal functions
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    document.body.style.overflow = 'auto';
    if (modalId === 'editModal') {
        currentEditId = null;
    }
}

// Close modal when clicking outside
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal(this.id);
        }
    });
});

// Storage functions
function saveBlogsToStorage() {
    const blogData = JSON.stringify(blogs);
    // Using a simple variable to store data instead of localStorage
    window.blogStorage = blogData;
}

function loadBlogsFromStorage() {
    try {
        const stored = window.blogStorage;
        if (stored) {
            blogs = JSON.parse(stored);
        }
    } catch (e) {
        console.log('No stored blogs found');
        blogs = [];
    }
}

// Add sample data
function addSampleData() {
    const sampleBlogs = [
        {
            id: 1,
            title: "The Digital Divide: Bridging Technology Gaps in Education",
            category: "Technology & Society",
            content: "In our increasingly digital world, access to technology has become a fundamental requirement for quality education. However, millions of students worldwide still lack reliable internet access and digital devices, creating a significant barrier to learning opportunities.\n\nThis digital divide affects not just academic performance, but also future career prospects and social mobility. Students without access to digital tools are often left behind in a world that increasingly demands technological literacy.\n\nCommunity initiatives, government programs, and public-private partnerships are essential to address this challenge. We must work together to ensure that every student has the tools they need to succeed in the 21st century.",
            author: "Sarah Chen",
            date: new Date().toLocaleDateString(),
            timestamp: new Date().toISOString()
        },
        {
            id: 2,
            title: "Climate Action: Individual Responsibility vs. Systemic Change",
            category: "Environment",
            content: "The climate crisis requires action at every level of society. While individual actions like reducing consumption and choosing sustainable options are important, we must also acknowledge that systemic change is crucial for meaningful impact.\n\nCorporations and governments hold significant power to implement large-scale changes that can address the root causes of climate change. Carbon pricing, renewable energy investments, and sustainable infrastructure development are examples of systemic solutions that can create lasting change.\n\nHowever, individual actions still matter. They raise awareness, create market demand for sustainable products, and demonstrate public support for environmental policies. The key is finding the right balance between personal responsibility and advocating for systemic change.",
            author: "Marcus Rodriguez",
            date: new Date(Date.now() - 86400000).toLocaleDateString(),
            timestamp: new Date(Date.now() - 86400000).toISOString()
        },
        {
            id: 3,
            title: "Mental Health Awareness in the Workplace",
            category: "Healthcare",
            content: "Mental health in the workplace has gained significant attention in recent years, and for good reason. The traditional approach of keeping personal struggles separate from professional life is being challenged as we recognize the interconnected nature of our well-being.\n\nEmployers are beginning to understand that supporting employee mental health is not just the right thing to do—it's also good business. Stress, anxiety, and depression can significantly impact productivity, creativity, and job satisfaction.\n\nProgressive companies are implementing mental health days, providing access to counseling services, creating supportive work environments, and training managers to recognize signs of mental health struggles. These initiatives benefit everyone and help create more compassionate workplaces.",
            author: "Dr. Amanda Foster",
            date: new Date(Date.now() - 172800000).toLocaleDateString(),
            timestamp: new Date(Date.now() - 172800000).toISOString()
        }
    ];
    
    blogs = sampleBlogs;
    saveBlogsToStorage();
    displayBlogs();
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal.active').forEach(modal => {
            closeModal(modal.id);
        });
    }
}); 