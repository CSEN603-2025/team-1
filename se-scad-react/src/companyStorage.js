// src/utils/companyStorage.js
export function getCurrentCompany() {
    try {
      const stored = localStorage.getItem('currentCompany') || sessionStorage.getItem('currentCompany');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error parsing stored company:', error);
      return null;
    }
  }
  
  export function setCurrentCompany(company) {
    try {
      const data = JSON.stringify(company);
      localStorage.setItem('currentCompany', data);
    } catch (error) {
      console.error('Error setting company data:', error);
    }
  }
  