# Settings Page Documentation

## Overview
A comprehensive account settings page built with Next.js 14, React, TypeScript, and shadcn/ui components.

## Location
- **URL**: `/settings` (accessible at `localhost:3000/settings` or your deployed URL)
- **Files Created**:
  - `/src/app/settings/page.tsx` - Server component wrapper with metadata
  - `/src/app/settings/settings-client.tsx` - Main client component with all functionality
  - `/src/app/api/user/update-profile/route.ts` - API endpoint for updating user profile
  - `/src/app/api/user/set-default-address/route.ts` - API endpoint for setting default address

## Features

### 1. Profile Tab
- **View Mode**: Display user's full name, phone number, and email
- **Edit Mode**: Update full name and phone number
- **Real-time Validation**: Prevents duplicate phone numbers
- **Success/Error Messages**: Clear feedback for all actions

### 2. Addresses Tab
- **List All Addresses**: Display all saved delivery addresses
- **Add New Address**: Dialog with Google Places autocomplete integration
- **Set Default Address**: Mark any address as the default
- **Delete Addresses**: Remove non-default addresses with confirmation
- **Visual Indicators**: Clear badges for default addresses

### 3. Account Tab
- **User ID**: Display unique user identifier
- **Email Address**: Show registered email (read-only)
- **Account Role**: Display role badges (Admin, Manager, or Customer)
- **Security Info**: Guidance on changing email/password through auth provider

## Technical Details

### Components Used
All components from shadcn/ui:
- `Button` - Various actions throughout the page
- `Input` - Text inputs for editing
- `Label` - Form labels
- `Card`, `CardContent`, `CardHeader`, `CardTitle`, `CardDescription` - Section containers
- `Tabs`, `TabsContent`, `TabsList`, `TabsTrigger` - Tab navigation
- `Separator` - Visual dividers
- `Badge` - Role and status indicators
- `AlertDialog` - Deletion confirmations
- `Dialog` - Address addition modal
- `Tooltip` - Contextual help

### State Management
- Uses Zustand stores:
  - `userStore` - User data and authentication
  - `addressStore` - Address management

### Authentication
- Protected route - redirects to `/signin` if not authenticated
- Uses Firebase Admin SDK for token verification
- Cookies-based session management

### API Endpoints

#### PATCH `/api/user/update-profile`
Updates user profile information.

**Request Body**:
```json
{
  "fullName": "string (optional)",
  "phone": "string (optional)"
}
```

**Response**: Updated user object

#### PATCH `/api/user/set-default-address`
Sets a user's default delivery address.

**Request Body**:
```json
{
  "addressId": "string (required)"
}
```

**Response**: Updated default address object

## Design Features

### Modern UI/UX
- **Gradient Accents**: Yellow to orange gradients for CTAs
- **Card-based Layout**: Clean, organized sections
- **Smooth Transitions**: All interactive elements have animations
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Icon Integration**: Lucide icons for visual clarity
- **Shadow Effects**: Depth and hierarchy through shadows
- **Rounded Corners**: Modern, friendly appearance

### Color Scheme
- Primary: Yellow (400-500) to Orange (500)
- Success: Green (50-800)
- Error: Red (50-800)
- Neutral: Gray (50-900)
- Background: White with subtle gradients

## User Flow

1. **Access Settings**:
   - Click user avatar/name in header
   - Select "Settings" from dropdown menu

2. **Edit Profile**:
   - Click "Edit Profile" button
   - Update fields as needed
   - Click "Save Changes" or "Cancel"

3. **Manage Addresses**:
   - Click "Addresses" tab
   - Add new addresses with "Add Address" button
   - Set any address as default
   - Delete non-default addresses

4. **View Account Info**:
   - Click "Account" tab
   - Review user ID, email, and role
   - Follow link to change auth credentials if needed

## Security Considerations

- **Authentication Required**: Page is protected and requires valid session
- **Token Verification**: All API calls verify Firebase auth tokens
- **User Ownership**: Can only modify own profile and addresses
- **Input Validation**: Server-side validation for all updates
- **Duplicate Prevention**: Prevents duplicate phone numbers

## Integration Points

### Existing Components
- `AddressForm` - Used for adding new addresses
- `UserDropdown` - Contains link to settings page
- Uses existing utility functions from `@/lib/utils/commonFunctions`

### Stores
- Integrates with existing Zustand stores
- No breaking changes to existing functionality

## Accessibility

- Semantic HTML structure
- Proper ARIA labels on interactive elements
- Keyboard navigation support
- Focus indicators on all interactive elements
- Screen reader friendly

## Future Enhancements

Potential additions:
- Email change functionality (requires auth provider integration)
- Password change functionality (requires auth provider integration)
- Order history link
- Notification preferences
- Payment methods management
- Two-factor authentication setup
- Account deletion option

## Testing

To test the settings page:

1. Start the dev server: `npm run dev`
2. Sign in to the application
3. Navigate to `/settings` or click Settings in user dropdown
4. Test each tab and functionality:
   - Edit and save profile information
   - Add, set default, and delete addresses
   - View account information
   - Verify error handling with invalid inputs
   - Test on different screen sizes

## Troubleshooting

### Common Issues

**"No token" error**:
- Ensure you're signed in
- Check if auth token is set in cookies
- Verify Firebase configuration

**TypeScript errors**:
- May need to restart TypeScript server
- Files are created correctly but IDE may need refresh

**Address form not showing Google autocomplete**:
- Verify Google Maps API key is set in environment variables
- Check NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

**Styling issues**:
- Ensure Tailwind CSS is properly configured
- Verify all shadcn/ui components are installed
