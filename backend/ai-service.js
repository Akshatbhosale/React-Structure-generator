import fetch from 'node-fetch';

class AIService {
  constructor() {
    this.possibleURLs = [
      'http://localhost:11434',
      'http://127.0.0.1:11434'
    ];
    this.model = 'llama2';
    this.isAIAvailable = false;
    this.checkAIAvailability();
  }

  async checkAIAvailability() {
    for (const url of this.possibleURLs) {
      try {
        const response = await fetch(`${url}/api/tags`, { 
          timeout: 3000 
        });
        if (response.ok) {
          this.baseURL = url;
          this.isAIAvailable = true;
          console.log(`✅ AI connected at: ${url}`);
          break;
        }
      } catch (error) {
        console.log(`❌ AI not available at: ${url}`);
      }
    }
    
    if (!this.isAIAvailable) {
      console.log('🚨 AI service not available. Using template fallbacks.');
    }
  }

  async generateProjectStructure(prompt) {
    if (!this.isAIAvailable) {
      console.log('Using fallback structure (AI unavailable)');
      return await this.generateComprehensiveFallback(prompt);
    }

    try {
      const systemPrompt = `You are an expert React.js project architect. Generate a COMPREHENSIVE and SPECIFIC folder and file structure for a React project.

IMPORTANT: Return ONLY valid JSON in this exact format. The structure MUST be COMPLETE and include multiple files:

{
  "name": "project-name",
  "type": "folder",
  "children": [
    {"name": "src", "type": "folder", "children": [
      {"name": "components", "type": "folder", "children": [
        {"name": "SpecificComponent1.jsx", "type": "file"},
        {"name": "SpecificComponent2.jsx", "type": "file"}
      ]},
      {"name": "pages", "type": "folder", "children": [
        {"name": "HomePage.jsx", "type": "file"},
        {"name": "AboutPage.jsx", "type": "file"}
      ]},
      {"name": "hooks", "type": "folder", "children": [
        {"name": "useCustomHook.js", "type": "file"}
      ]},
      {"name": "utils", "type": "folder", "children": [
        {"name": "helpers.js", "type": "file"}
      ]},
      {"name": "App.jsx", "type": "file"},
      {"name": "main.jsx", "type": "file"}
    ]},
    {"name": "public", "type": "folder", "children": [
      {"name": "index.html", "type": "file"}
    ]},
    {"name": "package.json", "type": "file"}
  ]
}

CRITICAL REQUIREMENTS:
1. MUST include at least 8-12 files total
2. MUST include multiple folders: components, pages, hooks, utils, public
3. MUST include context-specific file names based on the project
4. MUST include essential files: package.json, App.jsx, main.jsx, index.html
5. File names MUST be specific to the project domain

EXAMPLES FOR DIFFERENT PROJECTS:

FOR "car parking system":
- components/ParkingSlot.jsx, ParkingLot.jsx, TicketMachine.jsx, PaymentGateway.jsx
- pages/Dashboard.jsx, ParkingMap.jsx, AdminPanel.jsx, Reports.jsx
- hooks/useParking.js, usePayment.js
- utils/parkingCalculations.js, paymentUtils.js

FOR "restaurant app":
- components/MenuItem.jsx, OrderCart.jsx, RestaurantCard.jsx
- pages/Home.jsx, Menu.jsx, Checkout.jsx, OrderTracking.jsx
- hooks/useMenu.js, useOrders.js
- utils/menuUtils.js, orderCalculations.js

FOR "library system":
- components/BookCard.jsx, MemberForm.jsx, BorrowForm.jsx
- pages/Catalog.jsx, Members.jsx, Borrowing.jsx, Returns.jsx
- hooks/useBooks.js, useMembers.js
- utils/libraryUtils.js, dateCalculations.js

FOR "e-commerce store":
- components/ProductCard.jsx, ShoppingCart.jsx, CheckoutForm.jsx
- pages/Shop.jsx, ProductDetail.jsx, Cart.jsx, Checkout.jsx
- hooks/useProducts.js, useCart.js
- utils/productUtils.js, cartCalculations.js

FOR "social media app":
- components/Post.jsx, Feed.jsx, Profile.jsx, Chat.jsx
- pages/Home.jsx, Profile.jsx, Messages.jsx, Notifications.jsx
- hooks/usePosts.js, useMessages.js
- utils/socialUtils.js, notificationUtils.js

PROJECT DESCRIPTION: "${prompt}"

Based on the description above, create a COMPREHENSIVE structure with SPECIFIC file names.
Include AT LEAST 8-12 files total across multiple folders.

Return ONLY the JSON, no explanations.`;

      console.log('Calling AI with comprehensive structure prompt...');
      const response = await fetch(`${this.baseURL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          prompt: systemPrompt,
          stream: false,
          options: {
            temperature: 0.8,
          }
        }),
        timeout: 45000,
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('AI Raw Response:', data.response);
      
      const jsonMatch = data.response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          console.log('✅ Successfully parsed AI JSON');
          
          // Validate and enhance the structure
          const validatedStructure = this.validateAndEnhanceStructure(parsed, prompt);
          const enhancedStructure = this.ensureMinimumFiles(validatedStructure, prompt);
          const finalStructure = this.ensureEssentialFiles(enhancedStructure);
          
          console.log(`🎯 Final structure has ${this.countFiles(finalStructure)} files`);
          return finalStructure;
        } catch (parseError) {
          console.log('JSON parse error, using comprehensive fallback');
          return await this.generateComprehensiveFallback(prompt);
        }
      } else {
        throw new Error('No valid JSON found in AI response');
      }
    } catch (error) {
      console.error('AI Service Error:', error.message);
      return await this.generateComprehensiveFallback(prompt);
    }
  }

  // Validate and enhance the structure to ensure it's comprehensive
  validateAndEnhanceStructure(structure, prompt) {
    // Count total files
    const fileCount = this.countFiles(structure);
    console.log(`📊 AI generated ${fileCount} files`);
    
    // If structure is too minimal, use fallback
    if (fileCount < 5) {
      console.log('🔄 Structure too minimal, using comprehensive fallback');
      return this.generateComprehensiveFallback(prompt);
    }
    
    return structure;
  }

  // Count files in structure recursively
  countFiles(node) {
    if (node.type === 'file') {
      return 1;
    }
    if (node.children && node.children.length > 0) {
      return node.children.reduce((count, child) => count + this.countFiles(child), 0);
    }
    return 0;
  }

  // Ensure minimum files are present
  ensureMinimumFiles(structure, prompt) {
    const fileCount = this.countFiles(structure);
    console.log(`📊 Total files in structure: ${fileCount}`);
    
    // If structure has less than 8 files, enhance it
    if (fileCount < 8) {
      console.log('🔄 Enhancing structure with additional files');
      return this.enhanceStructureWithDomainFiles(structure, prompt);
    }
    
    return structure;
  }

  // Enhance structure with domain-specific files
  enhanceStructureWithDomainFiles(structure, prompt) {
    const lowerPrompt = prompt.toLowerCase();
    
    // Find the src folder
    const findSrcFolder = (node) => {
      if (node.name === 'src' && node.type === 'folder') return node;
      if (node.children) {
        for (const child of node.children) {
          const found = findSrcFolder(child);
          if (found) return found;
        }
      }
      return null;
    };
    
    const srcFolder = findSrcFolder(structure);
    if (!srcFolder) return structure;
    
    // Add domain-specific folders and files based on prompt
    if (lowerPrompt.includes('car parking') || lowerPrompt.includes('parking')) {
      this.addParkingFiles(srcFolder);
    } else if (lowerPrompt.includes('restaurant') || lowerPrompt.includes('food') || lowerPrompt.includes('menu')) {
      this.addRestaurantFiles(srcFolder);
    } else if (lowerPrompt.includes('library') || lowerPrompt.includes('book')) {
      this.addLibraryFiles(srcFolder);
    } else if (lowerPrompt.includes('ecommerce') || lowerPrompt.includes('shop') || lowerPrompt.includes('store')) {
      this.addEcommerceFiles(srcFolder);
    } else if (lowerPrompt.includes('social') || lowerPrompt.includes('feed') || lowerPrompt.includes('profile')) {
      this.addSocialMediaFiles(srcFolder);
    } else if (lowerPrompt.includes('hotel') || lowerPrompt.includes('booking')) {
      this.addHotelFiles(srcFolder);
    } else if (lowerPrompt.includes('school') || lowerPrompt.includes('student') || lowerPrompt.includes('teacher')) {
      this.addSchoolFiles(srcFolder);
    } else {
      // Generic enhancement
      this.addGenericFiles(srcFolder);
    }
    
    return structure;
  }

  // Add parking-specific files
  addParkingFiles(srcFolder) {
    console.log('🚗 Adding parking-specific files');
    
    // Ensure components folder exists
    let componentsFolder = srcFolder.children.find(child => child.name === 'components');
    if (!componentsFolder) {
      componentsFolder = { name: 'components', type: 'folder', children: [] };
      srcFolder.children.push(componentsFolder);
    }
    
    // Add parking components
    const parkingFolder = {
      name: 'parking',
      type: 'folder',
      children: [
        { name: 'ParkingSlot.jsx', type: 'file' },
        { name: 'ParkingLot.jsx', type: 'file' },
        { name: 'ParkingMap.jsx', type: 'file' },
        { name: 'SlotStatus.jsx', type: 'file' }
      ]
    };
    componentsFolder.children.push(parkingFolder);
    
    // Add ticket components
    const ticketFolder = {
      name: 'ticket',
      type: 'folder',
      children: [
        { name: 'TicketMachine.jsx', type: 'file' },
        { name: 'TicketDisplay.jsx', type: 'file' }
      ]
    };
    componentsFolder.children.push(ticketFolder);
    
    // Add payment components
    const paymentFolder = {
      name: 'payment',
      type: 'folder',
      children: [
        { name: 'PaymentGateway.jsx', type: 'file' },
        { name: 'PaymentForm.jsx', type: 'file' }
      ]
    };
    componentsFolder.children.push(paymentFolder);
    
    // Ensure pages folder exists
    let pagesFolder = srcFolder.children.find(child => child.name === 'pages');
    if (!pagesFolder) {
      pagesFolder = { name: 'pages', type: 'folder', children: [] };
      srcFolder.children.push(pagesFolder);
    }
    
    // Add parking pages
    pagesFolder.children.push(
      { name: 'Dashboard.jsx', type: 'file' },
      { name: 'ParkingMap.jsx', type: 'file' },
      { name: 'AdminPanel.jsx', type: 'file' }
    );
    
    // Ensure hooks folder exists
    let hooksFolder = srcFolder.children.find(child => child.name === 'hooks');
    if (!hooksFolder) {
      hooksFolder = { name: 'hooks', type: 'folder', children: [] };
      srcFolder.children.push(hooksFolder);
    }
    
    // Add parking hooks
    hooksFolder.children.push(
      { name: 'useParking.js', type: 'file' },
      { name: 'usePayment.js', type: 'file' }
    );
  }

  // Add restaurant-specific files
  addRestaurantFiles(srcFolder) {
    console.log('🍕 Adding restaurant-specific files');
    
    let componentsFolder = srcFolder.children.find(child => child.name === 'components');
    if (!componentsFolder) {
      componentsFolder = { name: 'components', type: 'folder', children: [] };
      srcFolder.children.push(componentsFolder);
    }
    
    const menuFolder = {
      name: 'menu',
      type: 'folder',
      children: [
        { name: 'MenuItem.jsx', type: 'file' },
        { name: 'MenuList.jsx', type: 'file' },
        { name: 'MenuCategory.jsx', type: 'file' }
      ]
    };
    componentsFolder.children.push(menuFolder);
    
    const orderFolder = {
      name: 'order',
      type: 'folder',
      children: [
        { name: 'OrderCart.jsx', type: 'file' },
        { name: 'OrderItem.jsx', type: 'file' }
      ]
    };
    componentsFolder.children.push(orderFolder);
    
    let pagesFolder = srcFolder.children.find(child => child.name === 'pages');
    if (!pagesFolder) {
      pagesFolder = { name: 'pages', type: 'folder', children: [] };
      srcFolder.children.push(pagesFolder);
    }
    
    pagesFolder.children.push(
      { name: 'Home.jsx', type: 'file' },
      { name: 'Menu.jsx', type: 'file' },
      { name: 'Checkout.jsx', type: 'file' }
    );
  }

  // Add library-specific files
  addLibraryFiles(srcFolder) {
    console.log('📚 Adding library-specific files');
    
    let componentsFolder = srcFolder.children.find(child => child.name === 'components');
    if (!componentsFolder) {
      componentsFolder = { name: 'components', type: 'folder', children: [] };
      srcFolder.children.push(componentsFolder);
    }
    
    const booksFolder = {
      name: 'books',
      type: 'folder',
      children: [
        { name: 'BookCard.jsx', type: 'file' },
        { name: 'BookList.jsx', type: 'file' },
        { name: 'BookSearch.jsx', type: 'file' }
      ]
    };
    componentsFolder.children.push(booksFolder);
    
    const membersFolder = {
      name: 'members',
      type: 'folder',
      children: [
        { name: 'MemberCard.jsx', type: 'file' },
        { name: 'MemberForm.jsx', type: 'file' }
      ]
    };
    componentsFolder.children.push(membersFolder);
    
    let pagesFolder = srcFolder.children.find(child => child.name === 'pages');
    if (!pagesFolder) {
      pagesFolder = { name: 'pages', type: 'folder', children: [] };
      srcFolder.children.push(pagesFolder);
    }
    
    pagesFolder.children.push(
      { name: 'Catalog.jsx', type: 'file' },
      { name: 'Members.jsx', type: 'file' },
      { name: 'Borrowing.jsx', type: 'file' }
    );
  }

  // Add e-commerce specific files
  addEcommerceFiles(srcFolder) {
    console.log('🛒 Adding e-commerce specific files');
    
    let componentsFolder = srcFolder.children.find(child => child.name === 'components');
    if (!componentsFolder) {
      componentsFolder = { name: 'components', type: 'folder', children: [] };
      srcFolder.children.push(componentsFolder);
    }
    
    const productsFolder = {
      name: 'products',
      type: 'folder',
      children: [
        { name: 'ProductCard.jsx', type: 'file' },
        { name: 'ProductList.jsx', type: 'file' },
        { name: 'ProductFilter.jsx', type: 'file' }
      ]
    };
    componentsFolder.children.push(productsFolder);
    
    const cartFolder = {
      name: 'cart',
      type: 'folder',
      children: [
        { name: 'CartItem.jsx', type: 'file' },
        { name: 'CartSummary.jsx', type: 'file' }
      ]
    };
    componentsFolder.children.push(cartFolder);
    
    let pagesFolder = srcFolder.children.find(child => child.name === 'pages');
    if (!pagesFolder) {
      pagesFolder = { name: 'pages', type: 'folder', children: [] };
      srcFolder.children.push(pagesFolder);
    }
    
    pagesFolder.children.push(
      { name: 'Shop.jsx', type: 'file' },
      { name: 'Product.jsx', type: 'file' },
      { name: 'Cart.jsx', type: 'file' }
    );
  }

  // Add social media specific files
  addSocialMediaFiles(srcFolder) {
    console.log('📱 Adding social media specific files');
    
    let componentsFolder = srcFolder.children.find(child => child.name === 'components');
    if (!componentsFolder) {
      componentsFolder = { name: 'components', type: 'folder', children: [] };
      srcFolder.children.push(componentsFolder);
    }
    
    const feedFolder = {
      name: 'feed',
      type: 'folder',
      children: [
        { name: 'Post.jsx', type: 'file' },
        { name: 'Feed.jsx', type: 'file' },
        { name: 'CreatePost.jsx', type: 'file' }
      ]
    };
    componentsFolder.children.push(feedFolder);
    
    const profileFolder = {
      name: 'profile',
      type: 'folder',
      children: [
        { name: 'Profile.jsx', type: 'file' },
        { name: 'ProfileHeader.jsx', type: 'file' }
      ]
    };
    componentsFolder.children.push(profileFolder);
    
    let pagesFolder = srcFolder.children.find(child => child.name === 'pages');
    if (!pagesFolder) {
      pagesFolder = { name: 'pages', type: 'folder', children: [] };
      srcFolder.children.push(pagesFolder);
    }
    
    pagesFolder.children.push(
      { name: 'Home.jsx', type: 'file' },
      { name: 'Profile.jsx', type: 'file' },
      { name: 'Messages.jsx', type: 'file' }
    );
  }

  // Add hotel booking files
  addHotelFiles(srcFolder) {
    console.log('🏨 Adding hotel booking files');
    
    let componentsFolder = srcFolder.children.find(child => child.name === 'components');
    if (!componentsFolder) {
      componentsFolder = { name: 'components', type: 'folder', children: [] };
      srcFolder.children.push(componentsFolder);
    }
    
    const roomsFolder = {
      name: 'rooms',
      type: 'folder',
      children: [
        { name: 'RoomCard.jsx', type: 'file' },
        { name: 'RoomList.jsx', type: 'file' }
      ]
    };
    componentsFolder.children.push(roomsFolder);
    
    const bookingFolder = {
      name: 'booking',
      type: 'folder',
      children: [
        { name: 'BookingForm.jsx', type: 'file' },
        { name: 'BookingCalendar.jsx', type: 'file' }
      ]
    };
    componentsFolder.children.push(bookingFolder);
    
    let pagesFolder = srcFolder.children.find(child => child.name === 'pages');
    if (!pagesFolder) {
      pagesFolder = { name: 'pages', type: 'folder', children: [] };
      srcFolder.children.push(pagesFolder);
    }
    
    pagesFolder.children.push(
      { name: 'Home.jsx', type: 'file' },
      { name: 'Rooms.jsx', type: 'file' },
      { name: 'Booking.jsx', type: 'file' }
    );
  }

  // Add school management files
  addSchoolFiles(srcFolder) {
    console.log('🏫 Adding school management files');
    
    let componentsFolder = srcFolder.children.find(child => child.name === 'components');
    if (!componentsFolder) {
      componentsFolder = { name: 'components', type: 'folder', children: [] };
      srcFolder.children.push(componentsFolder);
    }
    
    const studentsFolder = {
      name: 'students',
      type: 'folder',
      children: [
        { name: 'StudentCard.jsx', type: 'file' },
        { name: 'StudentList.jsx', type: 'file' }
      ]
    };
    componentsFolder.children.push(studentsFolder);
    
    const teachersFolder = {
      name: 'teachers',
      type: 'folder',
      children: [
        { name: 'TeacherCard.jsx', type: 'file' },
        { name: 'TeacherList.jsx', type: 'file' }
      ]
    };
    componentsFolder.children.push(teachersFolder);
    
    let pagesFolder = srcFolder.children.find(child => child.name === 'pages');
    if (!pagesFolder) {
      pagesFolder = { name: 'pages', type: 'folder', children: [] };
      srcFolder.children.push(pagesFolder);
    }
    
    pagesFolder.children.push(
      { name: 'Dashboard.jsx', type: 'file' },
      { name: 'Students.jsx', type: 'file' },
      { name: 'Teachers.jsx', type: 'file' }
    );
  }

  // Add generic files for unknown domains
  addGenericFiles(srcFolder) {
    console.log('📁 Adding generic files');
    
    let componentsFolder = srcFolder.children.find(child => child.name === 'components');
    if (!componentsFolder) {
      componentsFolder = { name: 'components', type: 'folder', children: [] };
      srcFolder.children.push(componentsFolder);
    }
    
    const uiFolder = {
      name: 'ui',
      type: 'folder',
      children: [
        { name: 'Button.jsx', type: 'file' },
        { name: 'Card.jsx', type: 'file' },
        { name: 'Header.jsx', type: 'file' }
      ]
    };
    componentsFolder.children.push(uiFolder);
    
    let pagesFolder = srcFolder.children.find(child => child.name === 'pages');
    if (!pagesFolder) {
      pagesFolder = { name: 'pages', type: 'folder', children: [] };
      srcFolder.children.push(pagesFolder);
    }
    
    pagesFolder.children.push(
      { name: 'Home.jsx', type: 'file' },
      { name: 'About.jsx', type: 'file' }
    );
    
    let hooksFolder = srcFolder.children.find(child => child.name === 'hooks');
    if (!hooksFolder) {
      hooksFolder = { name: 'hooks', type: 'folder', children: [] };
      srcFolder.children.push(hooksFolder);
    }
    
    hooksFolder.children.push(
      { name: 'useLocalStorage.js', type: 'file' }
    );
  }

  // Ensure essential files are present
  ensureEssentialFiles(structure) {
    const essentialFiles = ['package.json', 'App.jsx', 'main.jsx', 'index.html'];
    const existingFiles = this.getAllFileNames(structure);
    
    const missingFiles = essentialFiles.filter(file => !existingFiles.includes(file));
    
    if (missingFiles.length > 0 && structure.children) {
      missingFiles.forEach(file => {
        if (!structure.children.some(child => child.name === file)) {
          structure.children.push({
            name: file,
            type: 'file',
            id: Math.random().toString(36).substr(2, 9)
          });
        }
      });
    }
    
    return structure;
  }

  // Get all file names from structure
  getAllFileNames(node) {
    if (node.type === 'file') {
      return [node.name];
    }
    if (node.children && node.children.length > 0) {
      return node.children.flatMap(child => this.getAllFileNames(child));
    }
    return [];
  }

  cleanJSON(jsonString) {
    return jsonString
      .replace(/^[^{]*/, '')
      .replace(/[^}]*$/, '')
      .replace(/(\w+):/g, '"$1":')
      .replace(/'/g, '"');
  }

  async generateComprehensiveFallback(prompt) {
    console.log('Using comprehensive fallback generation');
    
    const lowerPrompt = prompt.toLowerCase();
    
    // Car Parking System - Comprehensive Structure
    if (lowerPrompt.includes('car parking') || lowerPrompt.includes('parking system') || 
        lowerPrompt.includes('parking lot') || lowerPrompt.includes('car park')) {
      console.log('🚗 Generating comprehensive car parking system structure');
      return {
        name: 'car-parking-system',
        type: 'folder',
        children: [
          {
            name: 'src',
            type: 'folder',
            children: [
              {
                name: 'components',
                type: 'folder',
                children: [
                  {
                    name: 'parking',
                    type: 'folder',
                    children: [
                      { name: 'ParkingSlot.jsx', type: 'file' },
                      { name: 'ParkingLot.jsx', type: 'file' },
                      { name: 'ParkingMap.jsx', type: 'file' },
                      { name: 'SlotStatus.jsx', type: 'file' }
                    ]
                  },
                  {
                    name: 'ticket',
                    type: 'folder',
                    children: [
                      { name: 'TicketMachine.jsx', type: 'file' },
                      { name: 'TicketDisplay.jsx', type: 'file' },
                      { name: 'TicketScanner.jsx', type: 'file' }
                    ]
                  },
                  {
                    name: 'payment',
                    type: 'folder',
                    children: [
                      { name: 'PaymentGateway.jsx', type: 'file' },
                      { name: 'PaymentForm.jsx', type: 'file' },
                      { name: 'PaymentHistory.jsx', type: 'file' }
                    ]
                  },
                  {
                    name: 'vehicle',
                    type: 'folder',
                    children: [
                      { name: 'VehicleEntry.jsx', type: 'file' },
                      { name: 'VehicleExit.jsx', type: 'file' },
                      { name: 'VehicleTracker.jsx', type: 'file' }
                    ]
                  }
                ]
              },
              {
                name: 'pages',
                type: 'folder',
                children: [
                  { name: 'Dashboard.jsx', type: 'file' },
                  { name: 'ParkingMap.jsx', type: 'file' },
                  { name: 'AdminPanel.jsx', type: 'file' },
                  { name: 'Reports.jsx', type: 'file' },
                  { name: 'Settings.jsx', type: 'file' }
                ]
              },
              {
                name: 'hooks',
                type: 'folder',
                children: [
                  { name: 'useParking.js', type: 'file' },
                  { name: 'usePayment.js', type: 'file' },
                  { name: 'useVehicles.js', type: 'file' }
                ]
              },
              {
                name: 'context',
                type: 'folder',
                children: [
                  { name: 'ParkingContext.jsx', type: 'file' },
                  { name: 'PaymentContext.jsx', type: 'file' }
                ]
              },
              {
                name: 'utils',
                type: 'folder',
                children: [
                  { name: 'parkingCalculations.js', type: 'file' },
                  { name: 'paymentUtils.js', type: 'file' },
                  { name: 'timeCalculations.js', type: 'file' }
                ]
              },
              { name: 'App.jsx', type: 'file' },
              { name: 'main.jsx', type: 'file' },
              { name: 'index.css', type: 'file' }
            ]
          },
          {
            name: 'public',
            type: 'folder',
            children: [
              { name: 'index.html', type: 'file' },
              { name: 'favicon.ico', type: 'file' }
            ]
          },
          { name: 'package.json', type: 'file' },
          { name: 'README.md', type: 'file' }
        ]
      };
    }

    // Restaurant/Food Delivery
    if (lowerPrompt.includes('restaurant') || lowerPrompt.includes('food') || lowerPrompt.includes('delivery') || lowerPrompt.includes('menu')) {
      console.log('🍕 Generating comprehensive restaurant app structure');
      return {
        name: 'restaurant-app',
        type: 'folder',
        children: [
          {
            name: 'src',
            type: 'folder',
            children: [
              {
                name: 'components',
                type: 'folder',
                children: [
                  {
                    name: 'menu',
                    type: 'folder',
                    children: [
                      { name: 'MenuItem.jsx', type: 'file' },
                      { name: 'MenuList.jsx', type: 'file' },
                      { name: 'MenuCategory.jsx', type: 'file' },
                      { name: 'MenuSearch.jsx', type: 'file' }
                    ]
                  },
                  {
                    name: 'order',
                    type: 'folder',
                    children: [
                      { name: 'OrderCart.jsx', type: 'file' },
                      { name: 'OrderItem.jsx', type: 'file' },
                      { name: 'OrderSummary.jsx', type: 'file' }
                    ]
                  },
                  {
                    name: 'restaurant',
                    type: 'folder',
                    children: [
                      { name: 'RestaurantCard.jsx', type: 'file' },
                      { name: 'RestaurantInfo.jsx', type: 'file' }
                    ]
                  }
                ]
              },
              {
                name: 'pages',
                type: 'folder',
                children: [
                  { name: 'Home.jsx', type: 'file' },
                  { name: 'Menu.jsx', type: 'file' },
                  { name: 'Order.jsx', type: 'file' },
                  { name: 'Checkout.jsx', type: 'file' },
                  { name: 'Tracking.jsx', type: 'file' }
                ]
              },
              {
                name: 'hooks',
                type: 'folder',
                children: [
                  { name: 'useMenu.js', type: 'file' },
                  { name: 'useOrders.js', type: 'file' }
                ]
              },
              {
                name: 'utils',
                type: 'folder',
                children: [
                  { name: 'menuUtils.js', type: 'file' },
                  { name: 'orderCalculations.js', type: 'file' }
                ]
              },
              { name: 'App.jsx', type: 'file' },
              { name: 'main.jsx', type: 'file' }
            ]
          },
          { name: 'package.json', type: 'file' }
        ]
      };
    }

    // If no specific match, use a comprehensive basic structure
    console.log('📁 Generating comprehensive basic structure');
    return {
      name: 'react-app',
      type: 'folder',
      children: [
        {
          name: 'src',
          type: 'folder',
          children: [
            {
              name: 'components',
              type: 'folder',
              children: [
                {
                  name: 'ui',
                  type: 'folder',
                  children: [
                    { name: 'Button.jsx', type: 'file' },
                    { name: 'Card.jsx', type: 'file' },
                    { name: 'Header.jsx', type: 'file' },
                    { name: 'Footer.jsx', type: 'file' }
                  ]
                }
              ]
            },
            {
              name: 'pages',
              type: 'folder',
              children: [
                { name: 'Home.jsx', type: 'file' },
                { name: 'About.jsx', type: 'file' },
                { name: 'Contact.jsx', type: 'file' }
              ]
            },
            {
              name: 'hooks',
              type: 'folder',
              children: [
                { name: 'useLocalStorage.js', type: 'file' }
              ]
            },
            {
              name: 'utils',
              type: 'folder',
              children: [
                { name: 'helpers.js', type: 'file' },
                { name: 'constants.js', type: 'file' }
              ]
            },
            { name: 'App.jsx', type: 'file' },
            { name: 'main.jsx', type: 'file' },
            { name: 'index.css', type: 'file' }
          ]
        },
        {
          name: 'public',
          type: 'folder',
          children: [
            { name: 'index.html', type: 'file' }
          ]
        },
        { name: 'package.json', type: 'file' },
        { name: 'README.md', type: 'file' }
      ]
    };
  }
}

export default new AIService();