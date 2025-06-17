export const checkUserAuthentication = async () => {
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) 
      {
        console.warn('No token found in localStorage.');
        return false;
      }
      
      const response = await fetch('http://localhost:4000/check-auth',{
        headers: {
          Authorization :`Bearer ${token}`,
        },
      });

      if (!response.ok){
        console.error('Error checking authentication. Server response:', response.statusText);
        return false;
      }
      const responseData = await response.json();
      return responseData.authenticated;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  };