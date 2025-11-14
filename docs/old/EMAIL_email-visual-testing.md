# Email Template Visual Testing Guide

This document provides guidelines for manually testing email templates across different email clients and devices.

## Requirements

- Requirements: 5.1, 5.4, 6.3

## Supported Languages

All email templates must be tested in the following languages:
- English (en)
- Turkish (tr)
- German (de)
- Chinese (zh)
- Russian (ru)

## Email Clients to Test

### Desktop Email Clients

1. **Gmail (Web)**
   - Chrome browser
   - Firefox browser
   - Safari browser
   - Edge browser

2. **Outlook (Desktop)**
   - Outlook 2016
   - Outlook 2019
   - Outlook 365

3. **Apple Mail (macOS)**
   - Latest version

4. **Thunderbird**
   - Latest version

### Mobile Email Clients

1. **Gmail (Mobile)**
   - iOS app
   - Android app

2. **Apple Mail (iOS)**
   - iPhone
   - iPad

3. **Outlook (Mobile)**
   - iOS app
   - Android app

4. **Samsung Email (Android)**

## Test Checklist

### Visual Appearance

- [ ] Logo displays correctly
- [ ] Brand colors (#2d7a4f) render properly
- [ ] Fonts are readable and properly sized
- [ ] Spacing and padding are consistent
- [ ] Borders and dividers display correctly
- [ ] Icons/emojis render properly
- [ ] Background colors display correctly

### Responsive Design

- [ ] Email width adapts to screen size
- [ ] Text is readable without zooming
- [ ] Buttons are touch-friendly (minimum 44x44px)
- [ ] Images scale appropriately
- [ ] Tables don't overflow on mobile
- [ ] Horizontal scrolling is not required

### Content

- [ ] All text is visible and readable
- [ ] Links are clickable and work correctly
- [ ] Buttons have proper hover states (desktop)
- [ ] Unsubscribe link is present and functional
- [ ] Personalization (username, etc.) displays correctly
- [ ] Numbers and dates format correctly for locale

### Language-Specific Tests

For each language (en, tr, de, zh, ru):

- [ ] All text translates correctly
- [ ] No text overflow or truncation
- [ ] Character encoding is correct (especially for zh, ru)
- [ ] Date and number formatting matches locale
- [ ] Text direction is correct (LTR for all current languages)

### Email Client Specific

#### Gmail
- [ ] Email doesn't get clipped (under 102KB)
- [ ] Images load correctly
- [ ] Links work properly
- [ ] Responsive design works on mobile app

#### Outlook
- [ ] Layout renders correctly (table-based)
- [ ] Buttons display properly
- [ ] Background colors show correctly
- [ ] No broken images

#### Apple Mail
- [ ] Dark mode compatibility
- [ ] Retina display optimization
- [ ] Interactive elements work

## Testing Process

### 1. Generate Test Emails

Run the email preview scripts to generate HTML for each template:

```bash
npm run email:preview
```

### 2. Send Test Emails

Use the test scripts to send emails to your test accounts:

```bash
# Test welcome email
npm run email:test:welcome

# Test task completion email
npm run email:test:task-completion

# Test wallet emails
npm run email:test:wallet

# Test admin emails
npm run email:test:admin
```

### 3. Visual Inspection

For each email template:

1. Open in each email client
2. Check all items in the test checklist
3. Take screenshots for documentation
4. Note any issues or inconsistencies

### 4. Mobile Testing

1. Forward test emails to mobile devices
2. Open in native email apps
3. Test in both portrait and landscape orientations
4. Verify touch interactions work properly

### 5. Dark Mode Testing

For email clients that support dark mode:

1. Enable dark mode
2. Verify text remains readable
3. Check that colors have sufficient contrast
4. Ensure images display appropriately

## Common Issues and Solutions

### Issue: Images Not Loading

**Solution:**
- Ensure image URLs are absolute (https://)
- Check that images are hosted on accessible server
- Verify image file sizes are optimized

### Issue: Layout Breaks in Outlook

**Solution:**
- Use table-based layouts
- Avoid flexbox and grid
- Use inline styles
- Test with VML for backgrounds

### Issue: Text Too Small on Mobile

**Solution:**
- Use minimum 14px font size
- Increase line height to 1.5+
- Add adequate padding around text

### Issue: Buttons Not Clickable on Mobile

**Solution:**
- Ensure minimum 44x44px touch target
- Add padding around button text
- Use display:block for full-width buttons

### Issue: Email Clipped in Gmail

**Solution:**
- Reduce HTML size (under 102KB)
- Minimize inline styles
- Remove unnecessary whitespace
- Optimize images

## Automated Testing

Run the automated test suite:

```bash
# Run all email template tests
npm test emails/__tests__/email-templates.test.tsx

# Run email client compatibility tests
npm test emails/__tests__/email-client-compatibility.test.ts
```

## Documentation

After testing, document:

1. **Test Results**: Record which clients passed/failed
2. **Screenshots**: Capture visual appearance in each client
3. **Issues Found**: List any problems discovered
4. **Resolutions**: Document how issues were fixed

## Test Report Template

```markdown
# Email Template Test Report

**Date:** [Date]
**Tester:** [Name]
**Template:** [Template Name]

## Desktop Clients

| Client | Version | Status | Notes |
|--------|---------|--------|-------|
| Gmail Web | Latest | ✅ Pass | |
| Outlook 365 | Latest | ✅ Pass | |
| Apple Mail | Latest | ✅ Pass | |
| Thunderbird | Latest | ✅ Pass | |

## Mobile Clients

| Client | Device | Status | Notes |
|--------|--------|--------|-------|
| Gmail iOS | iPhone 12 | ✅ Pass | |
| Gmail Android | Pixel 5 | ✅ Pass | |
| Apple Mail | iPhone 12 | ✅ Pass | |
| Outlook iOS | iPhone 12 | ✅ Pass | |

## Languages Tested

- [x] English (en)
- [x] Turkish (tr)
- [x] German (de)
- [x] Chinese (zh)
- [x] Russian (ru)

## Issues Found

1. [Issue description]
   - **Severity:** High/Medium/Low
   - **Client:** [Affected client]
   - **Resolution:** [How it was fixed]

## Screenshots

[Attach screenshots showing email in different clients]

## Conclusion

[Overall assessment of email template quality]
```

## Best Practices

1. **Test Early and Often**: Test emails during development, not just at the end
2. **Use Real Email Clients**: Don't rely solely on preview tools
3. **Test on Real Devices**: Mobile simulators don't always match real behavior
4. **Check Spam Scores**: Use tools like Mail Tester to check deliverability
5. **Monitor Analytics**: Track open rates and click rates in production
6. **Keep Templates Simple**: Simpler designs are more reliable across clients
7. **Use Fallbacks**: Provide plain text versions for all HTML emails

## Resources

- [Litmus Email Testing](https://litmus.com/)
- [Email on Acid](https://www.emailonacid.com/)
- [Can I Email](https://www.caniemail.com/)
- [Really Good Emails](https://reallygoodemails.com/)
- [Email Client Market Share](https://emailclientmarketshare.com/)

## Maintenance

- Review and update this guide quarterly
- Re-test templates when email clients update
- Monitor user feedback for rendering issues
- Keep track of new email client features
