// Avaada AI Platform - JavaScript functionality
// Handles mobile menu toggle and Open WebUI integration

document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu elements
    const hamburger = document.getElementById('hamburger');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const startChatBtn = document.getElementById('startChatBtn');
    const webuiFrame = document.getElementById('webuiFrame');
    const fallbackMessage = document.getElementById('fallbackMessage');
    
    // Mobile menu toggle functionality
    function toggleMobileMenu() {
        hamburger.classList.toggle('active');
        sidebar.classList.toggle('show');
        sidebarOverlay.classList.toggle('show');
        
        // Prevent body scroll when menu is open
        document.body.style.overflow = sidebar.classList.contains('show') ? 'hidden' : 'auto';
    }
    
    // Close mobile menu
    function closeMobileMenu() {
        hamburger.classList.remove('active');
        sidebar.classList.remove('show');
        sidebarOverlay.classList.remove('show');
        document.body.style.overflow = 'auto';
    }
    
    // Event listeners for mobile menu
    if (hamburger) {
        hamburger.addEventListener('click', toggleMobileMenu);
    }
    
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeMobileMenu);
    }
    
    // Close menu when clicking sidebar links (for mobile)
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                closeMobileMenu();
            }
        });
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            closeMobileMenu();
        }
    });
    
    // Start Chat button functionality
    if (startChatBtn) {
        startChatBtn.addEventListener('click', () => {
            // Scroll to the iframe area
            const contentArea = document.querySelector('.content-area');
            if (contentArea) {
                contentArea.scrollIntoView({ behavior: 'smooth' });
            }
            
            // Focus the iframe if it's loaded
            if (webuiFrame && webuiFrame.contentWindow) {
                try {
                    webuiFrame.contentWindow.focus();
                } catch (e) {
                    // Cross-origin restriction - ignore
                    console.log('Cannot focus iframe due to cross-origin restrictions');
                }
            }
        });
    }
    
    // Open WebUI iframe monitoring
    if (webuiFrame) {
        let iframeLoadTimeout;
        
        // Show loading state initially
        webuiFrame.style.opacity = '0';
        
        webuiFrame.addEventListener('load', function() {
            clearTimeout(iframeLoadTimeout);
            
            // Check if iframe loaded successfully
            try {
                const iframeDoc = webuiFrame.contentDocument || webuiFrame.contentWindow.document;
                if (iframeDoc) {
                    // Successfully loaded
                    webuiFrame.style.opacity = '1';
                    fallbackMessage.classList.remove('show');
                    
                    // TODO: Integration point for Open WebUI events
                    // This is where you could add listeners for Open WebUI specific events
                    // Example: webuiFrame.contentWindow.addEventListener('message', handleWebuiMessage);
                }
            } catch (e) {
                // Cross-origin or other error - assume it's working if no error page
                webuiFrame.style.opacity = '1';
                fallbackMessage.classList.remove('show');
            }
        });
        
        webuiFrame.addEventListener('error', function() {
            clearTimeout(iframeLoadTimeout);
            showFallbackMessage();
        });
        
        // Set timeout to show fallback if iframe doesn't load within 10 seconds
        iframeLoadTimeout = setTimeout(() => {
            // Check if iframe is still loading or failed
            if (webuiFrame.style.opacity === '0') {
                showFallbackMessage();
            }
        }, 10000);
    }
    
    // Show fallback message when Open WebUI is not available
    function showFallbackMessage() {
        webuiFrame.style.display = 'none';
        fallbackMessage.classList.add('show');
        console.log('Open WebUI service appears to be offline');
    }
    
    // Navigation button functionality
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (!this.disabled) {
                // Remove active class from all buttons
                navButtons.forEach(btn => btn.classList.remove('nav-btn--active'));
                // Add active class to clicked button
                this.classList.add('nav-btn--active');
                
                // TODO: Integration point for navigation handling
                // This is where you could add logic to handle different sections
                // Example: loadSection(this.textContent.toLowerCase());
            }
        });
    });
    
    // Sidebar navigation functionality
    const sidebarNavLinks = document.querySelectorAll('.sidebar-link');
    sidebarNavLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            sidebarNavLinks.forEach(l => l.classList.remove('sidebar-link--active'));
            // Add active class to clicked link
            this.classList.add('sidebar-link--active');
            
            // TODO: Integration point for sidebar navigation
            // This is where you could add logic to handle different sidebar sections
            // Example: loadSidebarSection(this.textContent.trim());
        });
    });
    
    // TODO: Integration points for Open WebUI API communication
    // These functions can be expanded when integrating with Open WebUI
    
    function handleWebuiMessage(event) {
        // Handle messages from Open WebUI iframe
        // This could include chat status, user authentication, etc.
        console.log('Message from Open WebUI:', event.data);
    }
    
    function sendMessageToWebui(message) {
        // Send messages to Open WebUI iframe
        if (webuiFrame && webuiFrame.contentWindow) {
            try {
                webuiFrame.contentWindow.postMessage(message, '*');
            } catch (e) {
                console.error('Failed to send message to Open WebUI:', e);
            }
        }
    }
    
    function initializeWebuiIntegration() {
        // Initialize any specific integrations with Open WebUI
        // This could include setting up authentication, themes, etc.
        console.log('Initializing Open WebUI integration...');
        
        // Example: Apply Avaada theme to Open WebUI if supported
        const themeMessage = {
            type: 'theme',
            colors: {
                primary: '#7EA122',
                accent: '#284899',
                background: '#F5F8F5',
                text: '#374024'
            }
        };
        
        // Send theme after iframe loads
        setTimeout(() => {
            sendMessageToWebui(themeMessage);
        }, 2000);
    }
    
    // Initialize WebUI integration
    initializeWebuiIntegration();
    
    // Error handling for the application
    window.addEventListener('error', function(e) {
        console.error('Application error:', e.error);
        // TODO: Add error reporting or user notification here
    });
    
    // Console message for developers
    console.log('Avaada AI Platform initialized successfully');
    console.log('Open WebUI integration points are available for customization');
});