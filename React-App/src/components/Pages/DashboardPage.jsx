import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [changePasswordError, setChangePasswordError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user profile data
        const userProfileResponse = await axios.get('http://localhost:4000/api/user/profile', {
          headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
        });
        console.log('User Profile Response:', userProfileResponse.data);
        setUserData(userProfileResponse.data);
  
      } catch (error) {
        console.error('Error fetching user data:', error);
        navigate('/login');
      }
    };

    fetchData();
  }, [navigate]);

  const handlePasswordChange = async () => {
    try 
    {
      // Prompt the user for a new password
      const newPasswordInput = window.prompt('Enter your new password:');
      console.log('New password input:',newPasswordInput);
      if (newPasswordInput === null) 
      {
        // User clicked cancel
        return;
      }

      // Change password
      await axios.patch(
        'http://localhost:4000/api/user/change-password',
        { new_password: newPasswordInput },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
        }
      );
      setChangePasswordError(null);
      setNewPassword('');
      alert('Password changed successfully!');
    } 
    
    catch (error) 
    {
      console.error('Error changing password:', error);
      setChangePasswordError(`Error changing password: ${error.message}`);
    }
  };

  if (!userData) {
    // You can render a loading indicator while fetching data
    return <p>Loading...</p>;
  }

  return (
    <div>
  
      <h2></h2>
      <div style={{ padding: '0px', border: '0px solid #dddddd', marginBottom: '20px' }}>
        <h2 style={{ marginBottom: '10px' }}>Profile Info</h2>
        <table style={{ borderCollapse: 'collapse', width: '50%' }}>
          <tbody>
            <tr>
              <td style={{ border: 'none', textAlign: 'right', padding: '5px', width: '30%' }}>First Name:</td>
              <td style={{ border: 'none', textAlign: 'left', padding: '5px' }}>{userData.first_name}</td>
            </tr>
            <tr>
              <td style={{ border: 'none', textAlign: 'right', padding: '5px', width: '30%' }}>Last Name:</td>
              <td style={{ border: 'none', textAlign: 'left', padding: '5px' }}>{userData.last_name}</td>
            </tr>
            <tr>
              <td style={{ border: 'none', textAlign: 'right', padding: '5px', width: '30%' }}>Email:</td>
              <td style={{ border: 'none', textAlign: 'left', padding: '5px' }}>{userData.email}</td>
            </tr>
            <tr>
              <td colSpan="2" style={{ textAlign: 'center', padding: '10px' }}>
                <button onClick={handlePasswordChange} style={{ marginRight: '10px' }}>Change Password</button>
                {changePasswordError && <p style={{ color: 'red' }}>{changePasswordError}</p>}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
    );
  };
  
  export default Dashboard;