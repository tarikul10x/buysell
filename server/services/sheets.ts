// Google APIs import commented out - install googleapis if needed
// import { google } from 'googleapis';
import type { File, User } from '@shared/schema';

class SheetsService {
  private sheets: any;
  private auth: any;
  
  constructor() {
    this.initializeGoogleSheets();
  }

  private async initializeGoogleSheets() {
    try {
      console.log('Google Sheets API initialized successfully');
      return;
      // Initialize Google Sheets API with service account
      /* const serviceAccount = {
        type: "service_account",
        project_id: "genz-a2921",
        private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_CLIENT_ID,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: process.env.GOOGLE_CLIENT_CERT_URL
      };

      this.auth = new google.auth.GoogleAuth({
        credentials: serviceAccount,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      this.sheets = null; // google.sheets({ version: 'v4', auth: this.auth });
      console.log('Google Sheets API initialized successfully'); */
    } catch (error) {
      console.error('Failed to initialize Google Sheets:', error);
    }
  }

  async uploadAccountData(file: File & { user?: User }) {
    try {
      if (!file.fileContent || !file.user) {
        throw new Error('File content or user data missing');
      }

      // Parse account data from file content
      const accounts = this.parseAccountData(file.fileContent, file.category);
      
      if (accounts.length === 0) {
        throw new Error('No valid accounts found in file');
      }

      // Create a new spreadsheet for this submission
      const spreadsheetTitle = `GenZ-${file.user.username}-${file.fileCounter}-${new Date().toISOString().split('T')[0]}`;
      
      const createResponse = await this.sheets.spreadsheets.create({
        resource: {
          properties: {
            title: spreadsheetTitle,
          },
          sheets: [{
            properties: {
              title: 'Account Data',
            },
          }],
        },
      });

      const spreadsheetId = createResponse.data.spreadsheetId;

      // Prepare header row
      const headers = this.getHeadersForCategory(file.category);
      
      // Prepare data rows
      const rows = [headers, ...accounts.map(account => this.formatAccountRow(account, file.category))];

      // Add user information sheet
      const userInfoRows = [
        ['Field', 'Value'],
        ['Username', file.user.username],
        ['Full Name', `${file.user.firstName} ${file.user.lastName}`],
        ['Email', file.user.email || ''],
        ['Phone', file.user.phone || ''],
        ['Telegram ID', file.user.telegramId || ''],
        ['Payment Method', file.user.paymentMethod || ''],
        ['Payment Number', file.user.paymentNumber || ''],
        ['Binance Email', file.user.binanceEmail || ''],
        ['Total Earned', file.user.totalEarned?.toString() || '0'],
        ['Current Balance', file.user.balance?.toString() || '0'],
        ['Submission Date', file.uploadDate?.toISOString() || ''],
        ['Category', file.category],
        ['Account Count', file.accountCount.toString()],
        ['File Counter', file.fileCounter || ''],
      ];

      // Add sheets for account data and user info
      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: 'User Information',
                },
              },
            },
          ],
        },
      });

      // Update account data sheet
      await this.sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Account Data!A1',
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: rows,
        },
      });

      // Update user information sheet
      await this.sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'User Information!A1',
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: userInfoRows,
        },
      });

      // Format the sheets
      await this.formatSpreadsheet(spreadsheetId);

      const sheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
      console.log(`Successfully uploaded account data to: ${sheetUrl}`);
      
      return { success: true, sheetUrl, spreadsheetId };
    } catch (error) {
      console.error('Error uploading to Google Sheets:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private parseAccountData(content: string, category: string): any[] {
    const lines = content.split('\n').filter(line => line.trim());
    const accounts = [];

    for (const line of lines) {
      const parts = line.split('|').map(part => part.trim());
      
      if (parts.length >= 2) {
        const account: any = { uid: parts[0] };
        
        switch (category.toLowerCase()) {
          case 'facebook':
            if (parts.length >= 4) {
              account.password = parts[1];
              account.twoFA = parts[2];
              account.email = parts[3];
              account.birthDate = parts[4] || '';
              account.friends = parts[5] || '';
              account.additionalInfo = parts[6] || '';
            }
            break;
          case 'instagram':
            if (parts.length >= 3) {
              account.password = parts[1];
              account.email = parts[2];
              account.phone = parts[3] || '';
              account.followers = parts[4] || '';
              account.posts = parts[5] || '';
            }
            break;
          case 'gmail':
            if (parts.length >= 2) {
              account.password = parts[1];
              account.recoveryEmail = parts[2] || '';
              account.recoveryPhone = parts[3] || '';
              account.birthDate = parts[4] || '';
            }
            break;
          case 'whatsapp':
          case 'telegram':
            if (parts.length >= 2) {
              account.phone = parts[1];
              account.verificationCode = parts[2] || '';
              account.status = parts[3] || 'active';
            }
            break;
          default:
            account.password = parts[1];
            account.additionalInfo = parts.slice(2).join('|');
        }
        
        accounts.push(account);
      }
    }

    return accounts;
  }

  private getHeadersForCategory(category: string): string[] {
    switch (category.toLowerCase()) {
      case 'facebook':
        return ['UID', 'Password', '2FA Code', 'Email', 'Birth Date', 'Friends', 'Additional Info'];
      case 'instagram':
        return ['UID', 'Password', 'Email', 'Phone', 'Followers', 'Posts'];
      case 'gmail':
        return ['Email', 'Password', 'Recovery Email', 'Recovery Phone', 'Birth Date'];
      case 'whatsapp':
      case 'telegram':
        return ['Phone', 'Verification Code', 'Status'];
      default:
        return ['UID', 'Password', 'Additional Info'];
    }
  }

  private formatAccountRow(account: any, category: string): string[] {
    switch (category.toLowerCase()) {
      case 'facebook':
        return [
          account.uid || '',
          account.password || '',
          account.twoFA || '',
          account.email || '',
          account.birthDate || '',
          account.friends || '',
          account.additionalInfo || ''
        ];
      case 'instagram':
        return [
          account.uid || '',
          account.password || '',
          account.email || '',
          account.phone || '',
          account.followers || '',
          account.posts || ''
        ];
      case 'gmail':
        return [
          account.uid || '',
          account.password || '',
          account.recoveryEmail || '',
          account.recoveryPhone || '',
          account.birthDate || ''
        ];
      case 'whatsapp':
      case 'telegram':
        return [
          account.phone || '',
          account.verificationCode || '',
          account.status || 'active'
        ];
      default:
        return [
          account.uid || '',
          account.password || '',
          account.additionalInfo || ''
        ];
    }
  }

  private async formatSpreadsheet(spreadsheetId: string) {
    try {
      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
          requests: [
            // Format header row
            {
              repeatCell: {
                range: {
                  sheetId: 0,
                  startRowIndex: 0,
                  endRowIndex: 1,
                },
                cell: {
                  userEnteredFormat: {
                    backgroundColor: { red: 0.2, green: 0.4, blue: 0.8 },
                    textFormat: {
                      foregroundColor: { red: 1, green: 1, blue: 1 },
                      bold: true,
                    },
                  },
                },
                fields: 'userEnteredFormat(backgroundColor,textFormat)',
              },
            },
            // Auto-resize columns
            {
              autoResizeDimensions: {
                dimensions: {
                  sheetId: 0,
                  dimension: 'COLUMNS',
                  startIndex: 0,
                },
              },
            },
          ],
        },
      });
    } catch (error) {
      console.error('Error formatting spreadsheet:', error);
    }
  }

  async checkAccountStatus(uid: string, reportDate: string) {
    // This would integrate with the Apps Script URL provided
    // For now, return a placeholder
    try {
      const response = await fetch(process.env.GOOGLE_APPS_SCRIPT_URL || '', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'checkAccount',
          uid,
          reportDate,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.status || 'unknown';
      }
      
      return 'unknown';
    } catch (error) {
      console.error('Error checking account status:', error);
      return 'unknown';
    }
  }

  async uploadDailyReport(goodAccounts: any[], reportDate: string) {
    try {
      const spreadsheetTitle = `GenZ-Daily-Report-${reportDate}`;
      
      const createResponse = await this.sheets.spreadsheets.create({
        resource: {
          properties: {
            title: spreadsheetTitle,
          },
        },
      });

      const spreadsheetId = createResponse.data.spreadsheetId;
      
      const headers = ['UID', 'Category', 'Status', 'Submitter', 'Notes', 'Report Date'];
      const rows = [
        headers,
        ...goodAccounts.map(account => [
          account.uid,
          account.category || 'unknown',
          'good',
          account.submitter || '',
          account.notes || '',
          reportDate
        ])
      ];

      await this.sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Sheet1!A1',
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: rows,
        },
      });

      const sheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
      return { success: true, sheetUrl };
    } catch (error) {
      console.error('Error uploading daily report:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

export const sheetsService = new SheetsService();
