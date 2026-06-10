# Design Guidelines: Women's Fashion E-Commerce MVP

## Design Approach
**Reference-Based**: Drawing inspiration from premium fashion e-commerce (Reformation, Everlane, Net-a-Porter) combined with modern DTC brands. Focus on sophisticated, editorial aesthetics that showcase products elegantly.

## Core Design Principles
- **Editorial Photography First**: Large, high-quality product imagery drives the experience
- **Breathing Room**: Generous whitespace creates luxury perception
- **Effortless Navigation**: Intuitive product discovery with minimal friction
- **Mobile-First Fashion**: Optimized for on-the-go shopping

## Typography
- **Headings**: Playfair Display (serif) for elegant, editorial feel - 36px to 72px
- **Body**: Inter (sans-serif) for clean readability - 14px to 18px
- **Product Titles**: 20px medium weight
- **Prices**: 18px bold for prominence
- **CTA Buttons**: 16px uppercase with letter-spacing

## Layout System
**Spacing Primitives**: Tailwind units of 4, 6, 8, 12, 16, 24
- Product grids: gap-6 to gap-8
- Section padding: py-16 to py-24
- Container: max-w-7xl

## Essential Pages & Sections

### Homepage
1. **Hero Section**: Full-width lifestyle image (80vh) showcasing new collection with overlay text and blurred-background CTA button
2. **Featured Collections**: 3-column grid with category cards (Women, Accessories, Sale)
3. **New Arrivals**: 4-column product grid with hover zoom
4. **Lifestyle Gallery**: 2-3 column asymmetric grid showing styled looks
5. **Newsletter Signup**: Elegant centered form with benefits listed

### Product Listing Page
- Filter sidebar (left): Categories, sizes, colors, price range
- Product grid: 3-4 columns desktop, masonry-style optional
- Quick view on hover with "Add to Bag" button
- Pagination or infinite scroll

### Product Detail Page
- Large product gallery (left 60%): Main image + 4-6 thumbnails below
- Product info (right 40%): Title, price, size selector, quantity, description, size guide link, add to cart
- "You May Also Like" carousel below
- Customer reviews section

### Shopping Cart
- Side drawer (slides from right) with product thumbnails, quantities, subtotal
- Sticky "Proceed to Checkout" button

### Navigation
- **Header**: Logo center, shop categories left, search/account/cart icons right
- **Footer**: 4-column grid - Shop, About, Support, Social/Newsletter

## Component Library

**Product Cards**:
- Vertical orientation with product image (4:5 ratio)
- Quick shop button appears on hover
- Heart icon for wishlist
- Product name, price, color variations shown as dots

**Buttons**:
- Primary: Filled black with white text
- Secondary: Outlined with black border
- Ghost: Text-only for subtle actions
- All buttons: Rounded corners (6px), py-3 px-8

**Forms**:
- Clean line-style inputs with floating labels
- Subtle border-bottom only (not full border)
- Error states in soft red
- Checkboxes styled as minimal squares

**Filters**:
- Accordion-style collapsible sections
- Checkbox selections with count indicators
- Color swatches as circular previews
- Price range slider

## Images Required

1. **Hero Image**: Editorial lifestyle shot of model in featured outfit, natural lighting, aspirational setting (1920x1080)
2. **Category Cards**: 3 curated images representing Women's clothing, Accessories, Sale items (square format)
3. **Product Images**: Clean white/neutral background, front + detail shots, lifestyle on-model (5-8 per product)
4. **Lifestyle Gallery**: 6-8 styled outfit inspirations, mix of studio + outdoor settings
5. **About Section**: Brand story image, sustainable practices photo if applicable

## Key Interactions
- Smooth image crossfades on product hover
- Gentle scale transforms on card hover (1.02)
- Cart drawer slides smoothly from right
- Size selector highlights selected option
- Sticky header on scroll (reduces height)

## Responsive Behavior
- Desktop: 4-column grids, side-by-side layouts
- Tablet: 3-column grids, maintain sidebar
- Mobile: Single column, hamburger menu, bottom sticky cart bar

**Design Priority**: Create an immersive, magazine-quality shopping experience that elevates the products through sophisticated photography and restrained, elegant design choices.