# Google Drive MCP Server

A comprehensive Model Context Protocol (MCP) server that provides complete Google Drive integration, enabling AI models to search, read, create, modify, and organize files in Google Drive with rich formatting support.

## 🚀 Features

### Core Capabilities
- ✅ **Full CRUD Operations**: Create, read, update, delete, move, and copy files and folders
- ✅ **Rich Text Formatting**: Native Google Docs with markdown and HTML support
- ✅ **Google Workspace Integration**: Native support for Docs, Sheets, and **Google Slides**
- ✅ **Smart Format Detection**: Auto-detects content format (markdown, HTML, plain text)
- ✅ **Advanced Search**: Multi-filter search by type, date, owner, location, and content
- ✅ **File Organization**: Move, copy, rename files with folder management
- ✅ **Hierarchical Navigation**: Visual folder tree exploration with configurable depth
- ✅ **Safe Deletion**: Trash/permanent delete options with recovery capabilities
- ✅ **Authentication Management**: Built-in OAuth refresh and permission management

### 🎨 Google Slides Capabilities (NEW!)
- ✅ **Presentation Management**: Create, read, and organize Google Slides presentations
- ✅ **Slide Operations**: Add, duplicate, delete slides with various layout templates
- ✅ **Rich Content Insertion**: Text boxes, shapes, images with formatting support
- ✅ **Advanced Formatting**: Markdown-style text formatting (**bold**, *italic*, ~~strikethrough~~)
- ✅ **Shape Library**: 60+ built-in shapes including arrows, stars, callouts, and geometric shapes
- ✅ **Visual Customization**: Colors, borders, positioning, and sizing control
- ✅ **Batch Operations**: Efficient API usage with multiple operations per request
- ✅ **Text Replacement**: Global find/replace across entire presentations

### Tools

#### 📁 **File Management**

##### `gdrive_search`
Search for files in your Google Drive with powerful full-text search capabilities.
```json
{
  "query": "string (your search query)"
}
```

##### `gdrive_read_file`
Read file contents with intelligent format conversion.
```json
{
  "file_id": "string (Google Drive file ID)"
}
```

##### `gdrive_create_file`
Create new files with optional format conversion to Google Workspace formats.
```json
{
  "name": "string (file name)",
  "content": "string (file content)", 
  "mimeType": "string (optional, defaults to text/plain)",
  "parentFolderId": "string (optional folder ID)"
}
```

##### `gdrive_update_file`
Update existing regular files (non-Google Workspace documents).
```json
{
  "file_id": "string (file ID)",
  "content": "string (new content)",
  "mimeType": "string (optional)"
}
```

##### `gdrive_rename_file`
Rename any file or folder.
```json
{
  "file_id": "string (file ID)",
  "new_name": "string (new name)"
}
```

##### `gdrive_list_folder_contents`
List all files and folders within a specific folder with organized display.
```json
{
  "folder_id": "string (folder ID, use 'root' for root folder)",
  "include_trashed": "boolean (optional, defaults to false)"
}
```

##### `gdrive_move_file`
Move any file or folder to a different location in your Drive.
```json
{
  "file_id": "string (file ID to move)",
  "new_parent_id": "string (destination folder ID, use 'root' for root)"
}
```

##### `gdrive_copy_file`
Create a copy of any file with optional renaming and location change.
```json
{
  "file_id": "string (file ID to copy)",
  "new_name": "string (optional new name for copy)",
  "parent_folder_id": "string (optional destination folder)"
}
```

##### `gdrive_delete_file`
Delete files and folders with trash/permanent options.
```json
{
  "file_id": "string (file ID to delete)",
  "permanent": "boolean (optional, true for permanent delete, false for trash)"
}
```

##### `gdrive_advanced_search`
Powerful search with multiple filters for precise file discovery.
```json
{
  "query": "string (optional text search)",
  "file_type": "string (optional: document, spreadsheet, presentation, folder, image, pdf, text)",
  "modified_after": "string (optional YYYY-MM-DD date)",
  "modified_before": "string (optional YYYY-MM-DD date)",
  "owner": "string (optional owner email)",
  "folder_id": "string (optional folder to search within)",
  "include_trashed": "boolean (optional, defaults to false)",
  "max_results": "number (optional, defaults to 50, max 100)"
}
```

#### 📝 **Google Docs Management**

##### `gdrive_create_document`
Create rich Google Docs with full formatting support.
```json
{
  "name": "string (document name)",
  "content": "string (markdown/HTML/plain text content)",
  "parentFolderId": "string (optional folder ID)",
  "format_type": "string (optional: markdown, html, plain)"
}
```

##### `gdrive_update_document`  
Update existing Google Docs with rich formatting preservation.
```json
{
  "file_id": "string (document ID)",
  "content": "string (markdown/HTML/plain text content)",
  "format_type": "string (optional: markdown, html, plain)"
}
```

#### 📂 **Folder Management**

##### `gdrive_create_folder`
Create new folders and organize your Drive.
```json
{
  "name": "string (folder name)",
  "parentFolderId": "string (optional parent folder ID)"
}
```

##### `gdrive_get_folder_tree`
Get hierarchical folder structure with visual tree display.
```json
{
  "root_folder_id": "string (starting folder ID, use 'root' for entire Drive)",
  "max_depth": "number (optional, defaults to 3, max 10)",
  "include_files": "boolean (optional, defaults to false for folders only)"
}
```

#### 🎨 **Google Slides Management**

##### `gdrive_create_presentation`
Create a new Google Slides presentation.
```json
{
  "name": "string (presentation name)",
  "parentFolderId": "string (optional folder ID)"
}
```

##### `gdrive_add_slide`
Add a new slide to an existing presentation with layout support.
```json
{
  "presentation_id": "string (presentation ID)",
  "layout": "string (optional: BLANK, TITLE_AND_BODY, TITLE_ONLY, SECTION_HEADER, TITLE_AND_TWO_COLUMNS)",
  "insertion_index": "number (optional slide position)"
}
```

##### `gdrive_add_text_to_slide`
Add formatted text to a slide with rich styling support.
```json
{
  "presentation_id": "string (presentation ID)",
  "slide_id": "string (slide ID)",
  "text": "string (text with markdown formatting: **bold**, *italic*, ~~strikethrough~~)",
  "x": "number (optional X position in points, defaults to 50)",
  "y": "number (optional Y position in points, defaults to 50)",
  "width": "number (optional width in points, defaults to 400)",
  "height": "number (optional height in points, defaults to 100)"
}
```

##### `gdrive_add_shape_to_slide`
Add a shape to a slide with optional text content and styling.
```json
{
  "presentation_id": "string (presentation ID)",
  "slide_id": "string (slide ID)",
  "shape_type": "string (optional: RECTANGLE, ELLIPSE, TRIANGLE, ARROW, STAR, etc.)",
  "x": "number (optional X position)",
  "y": "number (optional Y position)",
  "width": "number (optional width)",
  "height": "number (optional height)",
  "text": "string (optional text content)",
  "fill_color": "object (optional RGB: {red: 0-1, green: 0-1, blue: 0-1})",
  "border_color": "object (optional RGB border color)",
  "border_width": "number (optional border width in points)"
}
```

##### `gdrive_add_image_to_slide`
Add an image to a slide from a publicly accessible URL.
```json
{
  "presentation_id": "string (presentation ID)",
  "slide_id": "string (slide ID)",
  "image_url": "string (publicly accessible image URL)",
  "x": "number (optional X position)",
  "y": "number (optional Y position)", 
  "width": "number (optional width for manual sizing)",
  "height": "number (optional height for manual sizing)"
}
```

##### `gdrive_delete_slide`
Delete a slide from a presentation.
```json
{
  "presentation_id": "string (presentation ID)",
  "slide_id": "string (slide ID to delete)"
}
```

##### `gdrive_duplicate_slide`
Duplicate an existing slide in a presentation.
```json
{
  "presentation_id": "string (presentation ID)",
  "slide_id": "string (slide ID to duplicate)",
  "insertion_index": "number (optional position for duplicated slide)"
}
```

##### `gdrive_get_presentation_info`
Get detailed information about a presentation and its slides.
```json
{
  "presentation_id": "string (presentation ID)"
}
```

##### `gdrive_replace_text_in_presentation`
Replace all instances of text throughout a presentation.
```json
{
  "presentation_id": "string (presentation ID)",
  "find_text": "string (text to find)",
  "replace_text": "string (replacement text)",
  "match_case": "boolean (optional case sensitivity, defaults to false)"
}
```

#### 🔐 **Authentication**

##### `gdrive_refresh_auth`
Refresh authentication credentials and update permissions from within your AI tool.
```json
{}
```

## 🎨 Rich Formatting Support

### Markdown Features
The server supports comprehensive markdown formatting in Google Docs:

```markdown
# Headers (H1-H6)
## Subheadings  
### And more...

**Bold text**
*Italic text*
~~Strikethrough text~~
`Inline code with highlighting`

[Clickable links](https://example.com)

> Blockquotes with styling

- Bullet lists
- With multiple items

1. Numbered lists
2. Auto-formatted

---
Horizontal dividers
```

### HTML Support
Full HTML tag conversion to Google Docs formatting:
- `<h1>` to `<h6>` → Native Google Docs headers
- `<strong>`, `<b>` → Bold formatting  
- `<em>`, `<i>` → Italic formatting
- `<code>` → Code highlighting
- `<a href="">` → Hyperlinks
- `<ul>`, `<ol>`, `<li>` → Formatted lists
- `<blockquote>` → Styled quotes

### Auto-Format Detection
- **Markdown**: Detected by presence of `**`, `#`, `*`, `` ` ``
- **HTML**: Detected by presence of `<` and `>` tags  
- **Plain Text**: Fallback for simple content
- **Manual Override**: Use `format_type` parameter to force specific parsing

### File Format Handling
**Reading Files:**
- 📝 Google Docs → Markdown
- 📊 Google Sheets → CSV  
- 📊 Google Presentations → Plain text
- 🎨 Google Drawings → PNG
- 📄 Text/JSON files → UTF-8 text
- 📦 Other files → Base64 encoded

**Creating Files:**
- Text content → Regular files or Google Workspace conversion
- Markdown/HTML → Rich Google Docs with native formatting
- CSV data → Google Sheets (when using appropriate MIME type)

## 🛠️ Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- A Google Cloud Project
- A Google Workspace or personal Google account

### Detailed Google Cloud Setup

1. **Create a Google Cloud Project**
   - Visit the [Google Cloud Console](https://console.cloud.google.com/projectcreate)
   - Click "New Project"
   - Enter a project name (e.g., "MCP GDrive Server")
   - Click "Create"
   - Wait for the project to be created and select it

2. **Enable Required APIs**
   - Go to the [API Library](https://console.cloud.google.com/apis/library)
   - Search for and enable the following APIs:
     - **Google Drive API** (for file operations)
     - **Google Docs API** (for rich document formatting)
     - **Google Slides API** (for presentation creation and editing)
   - Click "Enable" for each API and wait for activation

3. **Configure OAuth Consent Screen**
   - Navigate to [OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent)
   - Select User Type:
     - "Internal" if you're using Google Workspace
     - "External" for personal Google accounts
   - Click "Create"
   - Fill in the required fields:
     - App name: "MCP GDrive Server"
     - User support email: your email
     - Developer contact email: your email
   - Click "Save and Continue"
   - On the "Scopes" page:
     - Click "Add or Remove Scopes"  
     - Add the following scopes:
       - `https://www.googleapis.com/auth/drive` (for full Drive access)
       - `https://www.googleapis.com/auth/documents` (for Google Docs formatting)
       - `https://www.googleapis.com/auth/presentations` (for Google Slides editing)
     - Click "Update"
   - Click "Save and Continue"
   - Review the summary and click "Back to Dashboard"

4. **Create OAuth Client ID**
   - Go to [Credentials](https://console.cloud.google.com/apis/credentials)
   - Click "Create Credentials" at the top
   - Select "OAuth client ID"
   - Choose Application type: "Desktop app"
   - Name: "MCP GDrive Server Desktop Client"
   - Click "Create"
   - In the popup:
     - Click "Download JSON"
     - Save the file
     - Click "OK"

5. **Set Up Credentials in Project**
   ```bash
   # Create credentials directory
   mkdir credentials
   
   # Move and rename the downloaded JSON file
   mv path/to/downloaded/client_secret_*.json credentials/gcp-oauth.keys.json
   ```

### Installation

```bash
# Clone the repository
git clone https://github.com/felores/gdrive-mcp-server.git
cd gdrive-mcp-server

# Install dependencies
npm install

# Build the project
npm run build
```

### Authentication

1. Create a credentials directory and place your OAuth keys:
   ```bash
   mkdir credentials
   # Move your downloaded OAuth JSON file to the credentials directory as gcp-oauth.keys.json
   ```

2. Run the authentication command:
   ```bash
   node dist/index.js auth
   ```

3. Complete the OAuth flow in your browser
4. Credentials will be saved in `credentials/.gdrive-server-credentials.json`

## 🔧 Usage

### As a Command Line Tool

```bash
# Start the server
node dist/index.js
```

### Integration with Desktop App

Add this configuration to your app's server settings:

```json
{
  "mcpServers": {
    "gdrive": {
      "command": "node",
      "args": ["path/to/gdrive-mcp-server/dist/index.js"],
      "env": {
        "GOOGLE_APPLICATION_CREDENTIALS": "path/to/gdrive-mcp-server/credentials/gcp-oauth.keys.json",
        "MCP_GDRIVE_CREDENTIALS": "path/to/gdrive-mcp-server/credentials/.gdrive-server-credentials.json"
      }
    }
  }
}
```

Replace `path/to/gdrive-mcp-server` with the actual path to your installation directory.

## 💡 Example Usage

### Basic Operations
```typescript
// Search for files
const files = await gdrive_search({ query: "quarterly report" });

// Read any file
const content = await gdrive_read_file({ file_id: "your-file-id" });

// Create a simple text file
await gdrive_create_file({ 
  name: "meeting-notes.txt", 
  content: "Meeting notes from today..." 
});
```

### Rich Document Creation
```typescript
// Create a formatted Google Doc
await gdrive_create_document({
  name: "Project Proposal",
  content: `
# Project Proposal

## Overview
This document outlines our **exciting new project** with the following goals:

- Improve user engagement by *50%*
- Reduce costs through [automation](https://example.com)
- \`Implement\` modern architecture

> "Innovation distinguishes between a leader and a follower." - Steve Jobs

### Timeline
1. Planning phase (2 weeks)
2. Development phase (8 weeks) 
3. Testing phase (2 weeks)

---

**Next Steps:** Schedule team meeting to discuss details.
  `,
  parentFolderId: "your-folder-id"
});
```

### File Organization & Management
```typescript
// Update a Google Doc with new formatted content
await gdrive_update_document({
  file_id: "doc-id-here",
  content: "# Updated Title\n\nNew **bold** content with *formatting*!"
});

// Organize files and folders
await gdrive_create_folder({ name: "2024 Projects" });
await gdrive_move_file({ file_id: "file-id", new_parent_id: "folder-id" });
await gdrive_copy_file({ file_id: "template-id", new_name: "New Project Copy" });
await gdrive_rename_file({ file_id: "old-file-id", new_name: "New Name.docx" });

// List folder contents with organization
const contents = await gdrive_list_folder_contents({ 
  folder_id: "folder-id",
  include_trashed: false 
});

// Get visual folder tree structure
const tree = await gdrive_get_folder_tree({
  root_folder_id: "root",
  max_depth: 4,
  include_files: true
});
```

### Advanced Search & Discovery
```typescript
// Multi-filter advanced search
const searchResults = await gdrive_advanced_search({
  query: "quarterly report",
  file_type: "document",
  modified_after: "2024-01-01",
  owner: "colleague@company.com",
  folder_id: "reports-folder-id",
  max_results: 25
});

// Search by file type and date range
const recentImages = await gdrive_advanced_search({
  file_type: "image",
  modified_after: "2024-08-01",
  folder_id: "photos-folder"
});
```

### File Cleanup & Maintenance
```typescript
// Safe deletion (moves to trash)
await gdrive_delete_file({ file_id: "unwanted-file-id" });

// Permanent deletion (cannot be recovered)
await gdrive_delete_file({ file_id: "file-id", permanent: true });
```

### Google Slides Creation & Management
```typescript
// Create a new presentation
await gdrive_create_presentation({
  name: "Q4 Business Review",
  parentFolderId: "presentations-folder-id"
});

// Get detailed presentation information
const info = await gdrive_get_presentation_info({
  presentation_id: "your-presentation-id"
});

// Add slides with different layouts
await gdrive_add_slide({
  presentation_id: "your-presentation-id",
  layout: "TITLE_AND_BODY"
});

await gdrive_add_slide({
  presentation_id: "your-presentation-id", 
  layout: "TITLE_AND_TWO_COLUMNS",
  insertion_index: 2
});
```

### Rich Content & Visual Elements
```typescript
// Add formatted text to slides
await gdrive_add_text_to_slide({
  presentation_id: "your-presentation-id",
  slide_id: "slide-id",
  text: "## Quarterly **Results**\n\nKey achievements:\n- Revenue *increased* 25%\n- ~~Old target~~ exceeded\n- `Performance metrics` improved",
  x: 50,
  y: 100,
  width: 500,
  height: 200
});

// Add shapes with custom styling
await gdrive_add_shape_to_slide({
  presentation_id: "your-presentation-id",
  slide_id: "slide-id",
  shape_type: "ROUNDED_RECTANGLE",
  text: "**Call to Action**\nContact us today!",
  x: 200,
  y: 300,
  width: 300,
  height: 150,
  fill_color: { red: 0.2, green: 0.6, blue: 0.9 },
  border_color: { red: 0.1, green: 0.3, blue: 0.7 },
  border_width: 3
});

// Insert images from URLs
await gdrive_add_image_to_slide({
  presentation_id: "your-presentation-id",
  slide_id: "slide-id", 
  image_url: "https://example.com/chart.png",
  x: 400,
  y: 100,
  width: 350,
  height: 250
});

// Create arrow shapes for diagrams
await gdrive_add_shape_to_slide({
  presentation_id: "your-presentation-id",
  slide_id: "slide-id",
  shape_type: "RIGHT_ARROW",
  fill_color: { red: 0.9, green: 0.5, blue: 0.1 },
  x: 150,
  y: 200,
  width: 100,
  height: 50
});
```

### Slide Management Operations
```typescript
// Duplicate slides for templates
await gdrive_duplicate_slide({
  presentation_id: "your-presentation-id",
  slide_id: "template-slide-id",
  insertion_index: 5
});

// Global text replacement across presentation
await gdrive_replace_text_in_presentation({
  presentation_id: "your-presentation-id",
  find_text: "{{COMPANY_NAME}}",
  replace_text: "Acme Corporation",
  match_case: false
});

// Clean up unwanted slides
await gdrive_delete_slide({
  presentation_id: "your-presentation-id", 
  slide_id: "old-slide-id"
});
```

### Authentication Management
```typescript  
// Refresh permissions from within your AI tool
await gdrive_refresh_auth({});
```

## 🔒 Security

- All sensitive credentials are stored in the `credentials` directory  
- OAuth credentials and tokens are excluded from version control
- **Full Google Drive access** with create, read, update, delete permissions
- **Google Docs API access** for rich text formatting capabilities
- **Google Slides API access** for presentation creation and comprehensive editing
- Secure OAuth 2.0 authentication flow with refresh token support
- Built-in authentication refresh tool for easy permission updates

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This MCP server is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🔍 Troubleshooting

### Common Issues

#### Permission Errors
If you get "Insufficient Permission" errors:
1. **Re-authenticate with new scopes**: Run `gdrive_refresh_auth()` or `node dist/index.js auth`
2. **Check OAuth scopes**: Ensure you've added Drive, Docs, and Slides API scopes in Google Cloud Console
3. **Verify API enablement**: Confirm Google Drive API, Google Docs API, and Google Slides API are all enabled

#### Authentication Issues  
1. Verify your Google Cloud Project setup matches the instructions
2. Check that `credentials/gcp-oauth.keys.json` exists and is valid
3. Ensure credentials are properly placed in the `credentials` directory
4. Try deleting `credentials/.gdrive-server-credentials.json` and re-authenticating

#### Formatting Issues
1. **Google Docs not formatting**: Make sure you're using `gdrive_update_document` (not `gdrive_update_file`) for Google Docs
2. **Index errors**: These are usually resolved in the latest version - ensure you're using current code
3. **Content not appearing**: Check that the document ID is correct and you have edit permissions

#### General Issues
1. **Build errors**: Run `npm run build` after any code changes
2. **API errors**: Check the Google Cloud Console for API quotas and limits
3. **File not found**: Verify file IDs are correct and files exist in your accessible Drive folders

## 📚 Additional Resources

- [Google Drive API Documentation](https://developers.google.com/drive/api/v3/reference)
- [Google Docs API Documentation](https://developers.google.com/docs/api/reference/rest)
- [OAuth 2.0 for Desktop Apps](https://developers.google.com/identity/protocols/oauth2/native-app)
- [Model Context Protocol Documentation](https://modelcontextprotocol.io)
- [Markdown Syntax Guide](https://www.markdownguide.org/basic-syntax/)

## 🚀 What's New

### v3.0 Features (Latest) - COMPREHENSIVE GOOGLE SLIDES SUPPORT
- ✅ **Complete Slides API Integration**: Full Google Slides creation, editing, and management
- ✅ **Rich Content Creation**: Text boxes, shapes, images with advanced formatting
- ✅ **60+ Shape Types**: Comprehensive shape library including arrows, callouts, stars, and geometric shapes
- ✅ **Advanced Text Formatting**: Markdown-style formatting with bold, italic, strikethrough, and underline
- ✅ **Visual Customization**: Colors, borders, positioning, and sizing control for all elements
- ✅ **Layout Templates**: Support for various slide layouts (title, body, columns, etc.)
- ✅ **Batch Operations**: Efficient API usage for complex slide operations
- ✅ **Global Text Replacement**: Find and replace across entire presentations
- ✅ **Comprehensive Slide Management**: Add, duplicate, delete, and organize slides

### v2.1 Features
- ✅ **Advanced File Organization**: Move, copy, rename, and delete files with safety options
- ✅ **Folder Navigation**: List folder contents and hierarchical tree visualization  
- ✅ **Multi-Filter Search**: Advanced search by type, date, owner, location, and content
- ✅ **Visual Folder Trees**: Hierarchical structure display with configurable depth
- ✅ **Batch Operations**: Efficient bulk file management capabilities
- ✅ **Safe Deletion**: Trash/permanent delete options with recovery support

### v2.0 Features
- ✅ **Full CRUD Operations**: Complete create, read, update, delete functionality
- ✅ **Rich Google Docs Support**: Native formatting with markdown and HTML
- ✅ **Advanced Formatting**: Headers, bold, italic, links, lists, code, blockquotes
- ✅ **Smart Format Detection**: Auto-detects markdown, HTML, or plain text
- ✅ **Folder Management**: Create and organize folders
- ✅ **Built-in Auth Refresh**: Update permissions without leaving your AI tool
- ✅ **Enhanced Error Handling**: Better error messages and troubleshooting

### Complete Tool Set (25 Tools)
**File Management:** search, read, create, update, rename, move, copy, delete, list contents
**Google Docs:** create documents, update documents with rich formatting  
**Google Slides:** create presentations, add/duplicate/delete slides, add text/shapes/images, get info, replace text
**Folders:** create folders, get folder tree structure
**Search:** basic search, advanced multi-filter search
**Admin:** refresh authentication

### Upgrade from Earlier Versions
If you're upgrading from v1.0, v2.0, or v2.1:
1. **Enable Google Slides API** in Google Cloud Console
2. **Update OAuth scopes** to include `https://www.googleapis.com/auth/presentations`
3. **Re-authenticate**: `node dist/index.js auth` or use `gdrive_refresh_auth()`
4. **Enjoy complete Google Workspace integration** with Docs, Drive, and now comprehensive Slides support!
