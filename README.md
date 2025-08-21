# Google Drive MCP Server

A comprehensive Model Context Protocol (MCP) server that provides complete Google Drive integration, enabling AI models to search, read, create, modify, and organize files in Google Drive with rich formatting support.

## 🚀 Features

### Core Capabilities
- ✅ **Full CRUD Operations**: Create, read, update, and delete files and folders
- ✅ **Rich Text Formatting**: Native Google Docs with markdown and HTML support
- ✅ **Google Workspace Integration**: Native support for Docs, Sheets, and other formats
- ✅ **Smart Format Detection**: Auto-detects content format (markdown, HTML, plain text)
- ✅ **Advanced Search**: Powerful full-text search across your entire Drive
- ✅ **Authentication Management**: Built-in OAuth refresh and permission management

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

### Content Updates
```typescript
// Update a Google Doc with new formatted content
await gdrive_update_document({
  file_id: "doc-id-here",
  content: "# Updated Title\n\nNew **bold** content with *formatting*!"
});

// Organize files
await gdrive_create_folder({ name: "2024 Projects" });
await gdrive_rename_file({ file_id: "old-file-id", new_name: "New Name.docx" });
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
2. **Check OAuth scopes**: Ensure you've added both Drive and Docs API scopes in Google Cloud Console
3. **Verify API enablement**: Confirm both Google Drive API and Google Docs API are enabled

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

### v2.0 Features
- ✅ **Full CRUD Operations**: Complete create, read, update, delete functionality
- ✅ **Rich Google Docs Support**: Native formatting with markdown and HTML
- ✅ **Advanced Formatting**: Headers, bold, italic, links, lists, code, blockquotes
- ✅ **Smart Format Detection**: Auto-detects markdown, HTML, or plain text
- ✅ **Folder Management**: Create and organize folders
- ✅ **Built-in Auth Refresh**: Update permissions without leaving your AI tool
- ✅ **Enhanced Error Handling**: Better error messages and troubleshooting

### Upgrade from v1.0
If you're upgrading from the read-only version:
1. Update OAuth scopes in Google Cloud Console (add full Drive + Docs API access)
2. Re-authenticate: `node dist/index.js auth` or use `gdrive_refresh_auth()`
3. Enjoy full read-write capabilities with rich formatting!
