import axios from "axios";

export class ShebaService {
  private smmApiUrl: string;
  private smmApiKey: string;
  private shopApiUrl: string;
  private shopApiKey: string;

  constructor() {
    this.smmApiUrl = process.env.SHEBA_SMM_API_URL || "https://sheba.host/api/v2";
    this.smmApiKey = process.env.SHEBA_SMM_API_KEY || "";
    this.shopApiUrl = process.env.SHEBA_SHOP_API_URL || "https://sheba.host/api/v1";
    this.shopApiKey = process.env.SHEBA_SHOP_API_KEY || "";
  }

  // SMM Panel API
  async smmAction(action: string, params: any = {}) {
    try {
      const response = await axios.post(this.smmApiUrl, {
        key: this.smmApiKey,
        action,
        ...params
      });
      return response.data;
    } catch (error) {
      console.error("SMM API Error:", error);
      throw new Error("Failed to communicate with SMM Panel");
    }
  }

  // Shop API
  async shopAction(endpoint: string, method: 'GET' | 'POST' = 'GET', data: any = {}) {
    try {
      const config = {
        method,
        url: `${this.shopApiUrl}/${endpoint}`,
        headers: {
          'Authorization': `Bearer ${this.shopApiKey}`,
          'Content-Type': 'application/json'
        },
        data: method === 'POST' ? data : undefined,
        params: method === 'GET' ? data : undefined
      };
      const response = await axios(config);
      return response.data;
    } catch (error) {
      console.error("Shop API Error:", error);
      throw new Error("Failed to communicate with Shop API");
    }
  }
}

export const shebaService = new ShebaService();
