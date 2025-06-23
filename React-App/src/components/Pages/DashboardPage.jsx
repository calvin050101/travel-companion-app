import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FormHeaderDashboard from './FormStyles/FormHeaderDashboard';
import axios from 'axios';
import { Card, CardContent, CardActions, Typography, TextField, Grid, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core';

const Dashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [bookmarkGroups, setBookmarkGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [places, setPlaces] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);
  const [allBookmarks, setAllBookmarks] = useState([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [groupToEdit, setGroupToEdit] = useState('');
  const [newGroupName, setNewGroupName] = useState('');

  const [editableUserData, setEditableUserData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '*******',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userProfileResponse = await axios.get('https://travel-companion-app-backend.onrender.com/api/user/profile', {
          headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
        });

        const data = userProfileResponse.data;
        setUserData(data);
        setEditableUserData({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          password: '*******',
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
        navigate('/login');
      }
    };

    fetchData();
  }, [navigate]);

  useEffect(() => {
    if (activeTab === 'bookmark') fetchBookmarkGroups();
  }, [activeTab]);

  const fetchBookmarkGroups = async () => {
    try {
      const token = localStorage.getItem('access_token');

      const [listsRes, bookmarksRes] = await Promise.all([
        axios.get('https://travel-companion-app-backend.onrender.com/api/bookmarks/lists', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('https://travel-companion-app-backend.onrender.com/api/bookmarks', {
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);

      setBookmarkGroups(listsRes.data.lists);
      setAllBookmarks(bookmarksRes.data);
    } catch (error) {
      console.error('Failed to fetch bookmark groups or bookmarks:', error);
    }
  };

  const handleGroupClick = async (group) => {
    setSelectedGroup(group);
    try {
      const response = await axios.get('https://travel-companion-app-backend.onrender.com/api/bookmarks', {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
      });
      const groupPlaces = response.data.filter(b => b.list === group);
      setPlaces(groupPlaces);
    } catch (error) {
      console.error('Error loading places for group:', error);
    }
  };

  const handleDeleteGroup = async () => {
    try {
      await axios.delete('https://travel-companion-app-backend.onrender.com/api/bookmarks/group', {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
        data: { list: groupToDelete },
      });
      setBookmarkGroups(prev => prev.filter(g => g !== groupToDelete));
      if (selectedGroup === groupToDelete) setPlaces([]);
      setGroupToDelete(null);
      setDeleteDialogOpen(false);
    } catch (err) {
      console.error('Failed to delete group:', err);
      alert('Failed to delete bookmark list');
    }
  };

  const handleUpdateGroupName = async () => {
    if (!newGroupName.trim()) {
      alert("List name cannot be empty.");
      return;
    }

    try {
      await axios.patch('https://travel-companion-app-backend.onrender.com/api/bookmarks/group', {
        oldName: groupToEdit,
        newName: newGroupName,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      });

      setBookmarkGroups(prev =>
        prev.map(name => (name === groupToEdit ? newGroupName : name))
      );
      setAllBookmarks(prev =>
        prev.map(bookmark =>
          bookmark.list === groupToEdit
            ? { ...bookmark, list: newGroupName }
            : bookmark
        )
      );
      if (selectedGroup === groupToEdit) setSelectedGroup(newGroupName);

      setEditDialogOpen(false);
      setGroupToEdit('');
      setNewGroupName('');
    } catch (err) {
      console.error('Error updating group name:', err);
      alert('Failed to update list name');
    }
  };

  const handleDeletePlace = async (place) => {
    if (!window.confirm(`Remove "${place.name}" from "${selectedGroup}"?`)) return;
    try {
      await axios.delete('https://travel-companion-app-backend.onrender.com/api/bookmarks', {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
        data: {
          name: place.name,
          address: place.address,
          list: selectedGroup,
        },
      });
      setPlaces(prev => prev.filter(p => !(p.name === place.name && p.address === place.address && p.list === selectedGroup)));
      setAllBookmarks(prev => prev.filter(b => !(b.name === place.name && b.address === place.address && b.list === selectedGroup)));
    } catch (err) {
      console.error('Failed to delete bookmark:', err);
      alert('Error deleting place from list');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('userEmail');
    navigate('/');
  };

  const handlePasswordChange = async () => {
    const newPasswordInput = window.prompt('Enter your new password:');
    if (newPasswordInput === null) return;

    try {
      await axios.patch(
        'https://travel-companion-app-backend.onrender.com/api/user/change-password',
        { new_password: newPasswordInput },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
        }
      );
      alert('Password changed successfully!');
      setChangePasswordError(null);
    } catch (error) {
      console.error('Error changing password:', error);
      setChangePasswordError(`Error changing password: ${error.message}`);
    }
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setEditableUserData((prevData) => ({ ...prevData, [name]: value }));
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  if (!userData) return <p>Loading...</p>;

  const handleEditToggle = async () => {
    if (isEditing) {
      try {
        await axios.patch(
          'https://travel-companion-app-backend.onrender.com/api/user/update-profile',
          {
            first_name: editableUserData.first_name,
            last_name: editableUserData.last_name,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('access_token')}`,
            },
          }
        );
        alert('Profile updated successfully!');
      } catch (err) {
        console.error('Error saving profile:', err);
        alert('Failed to save profile');
      }
    }
    setIsEditing(!isEditing);
  };

  return (
    <div>
      <FormHeaderDashboard toggleSidebar={toggleSidebar} />
      {sidebarOpen && <div style={overlayStyle} onClick={closeSidebar} />}
      <div style={{ ...sidebarStyle, left: sidebarOpen ? '0' : '-250px' }}>
        <h3 style={{ padding: '20px 20px 0' }}>Menu</h3>
        <ul style={{ listStyle: 'none', padding: '20px' }}>
          <li style={{ marginBottom: '15px' }}>
            <button onClick={() => { setActiveTab('profile'); closeSidebar(); }} style={sidebarButtonStyle}>Profile</button>
          </li>
          <li>
            <button onClick={() => { setActiveTab('bookmark'); closeSidebar(); }} style={sidebarButtonStyle}>Bookmark</button>
          </li>
          <li style={{ marginTop: '30px', borderTop: '1px solid #ccc', paddingTop: '10px' }}>
            <button onClick={handleLogout} style={{ ...sidebarButtonStyle, color: 'red' }}>Logout</button>
          </li>
        </ul>
      </div>

      <div style={{ padding: '40px', marginLeft: '0px' }}>
        {activeTab === 'profile' && (
          <Card style={{ maxWidth: 600, margin: '0 auto', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>Profile Info</Typography>
              <div style={{ textAlign: 'right', marginBottom: '10px' }}>
                <button onClick={handleEditToggle}>{isEditing ? 'Save' : 'Edit'}</button>
              </div>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body1"><strong>First Name</strong></Typography>
                  <TextField fullWidth variant="filled" disabled={!isEditing} name="first_name" value={editableUserData.first_name} onChange={handleFieldChange} InputProps={{ disableUnderline: true }} />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body1"><strong>Last Name</strong></Typography>
                  <TextField fullWidth variant="filled" disabled={!isEditing} name="last_name" value={editableUserData.last_name} onChange={handleFieldChange} InputProps={{ disableUnderline: true }} />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body1"><strong>Email</strong></Typography>
                  <TextField fullWidth variant="filled" disabled value={editableUserData.email} InputProps={{ disableUnderline: true }} />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body1"><strong>Password</strong></Typography>
                  <TextField fullWidth variant="filled" disabled type="password" value="*******" InputProps={{ disableUnderline: true }} />
                </Grid>
                <Grid item xs={12} style={{ textAlign: 'center' }}>
                  <button onClick={handlePasswordChange}>Change Password</button>
                  {changePasswordError && <p style={{ color: 'red' }}>{changePasswordError}</p>}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {activeTab === 'bookmark' && (
          <div>
            <h2>Bookmarks</h2>

            {/* List View */}
            {!selectedGroup && (
              <Grid container spacing={2}>
                {bookmarkGroups.map(group => {
                  const placeCount = allBookmarks.filter(b => b.list === group).length;
                  return (
                    <Grid item xs={12} key={group}>
                      <Card style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px' }}>
                        <div onClick={() => handleGroupClick(group)} style={{ cursor: 'pointer' }}>
                          <Typography variant="subtitle1" style={{ fontWeight: 'bold' }}>{group}</Typography>
                          <Typography variant="body2" color="textSecondary">{placeCount} {placeCount === 1 ? 'place' : 'places'}</Typography>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Button size="small" onClick={() => {setGroupToEdit(group); setNewGroupName(group); setEditDialogOpen(true);}}>Edit</Button>
                          <Button size="small" color="secondary" onClick={() => { setGroupToDelete(group); setDeleteDialogOpen(true); }}>Delete</Button>
                        </div>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            )}

            {/* Places inside selected group */}
            {selectedGroup && (
              <div>
                <Button onClick={() => setSelectedGroup(null)} style={{ marginBottom: '16px' }}>
                  ← Back to Lists
                </Button>
                <h3>Places in "{selectedGroup}"</h3>

                <Grid container spacing={2}>
                  {places.map((place, idx) => (
                    <Grid item xs={12} key={idx}>
                      <Card style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px' }}>
                        <div>
                          <Typography variant="subtitle1" style={{ fontWeight: 'bold' }}>{place.name}</Typography>
                          <Typography variant="body2" color="textSecondary">{place.address}</Typography>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <Button size="small" onClick={() => window.open(place.web_url, '_blank')}>
                            View
                          </Button>
                          <Button
                            size="small"
                            color="secondary"
                            onClick={() => handleDeletePlace(place)}
                          >
                            Delete
                          </Button>
                        </div>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </div>
            )}

            {/* Delete confirmation dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Are you sure you want to delete the list "{groupToDelete}"? This will remove all bookmarks under this list.
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDeleteDialogOpen(false)} color="primary">Cancel</Button>
                <Button onClick={handleDeleteGroup} color="secondary">Delete</Button>
              </DialogActions>
            </Dialog>
            
            {/* Edit dialog */}
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
              <DialogTitle>Rename Bookmark List</DialogTitle>
              <DialogContent>
                <TextField
                  autoFocus
                  margin="dense"
                  label="New List Name"
                  type="text"
                  fullWidth
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setEditDialogOpen(false)} color="primary">Cancel</Button>
                <Button onClick={handleUpdateGroupName} color="primary">Save</Button>
              </DialogActions>
            </Dialog>

          </div>
        )}
      </div>
    </div>
  );
};

const sidebarStyle = {
  position: 'fixed', top: '0', bottom: '0', left: '0', width: '250px', backgroundColor: '#f0f0f0', boxShadow: '2px 0 5px rgba(0,0,0,0.3)', transition: 'left 0.3s ease-in-out', zIndex: 1002,
};

const sidebarButtonStyle = {
  width: '100%', padding: '10px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '16px',
};

const overlayStyle = {
  position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 1000,
};

export default Dashboard;
