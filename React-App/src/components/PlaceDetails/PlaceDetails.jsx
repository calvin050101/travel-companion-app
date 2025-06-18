import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Card, CardMedia, CardContent, CardActions,
  Chip, Dialog, DialogTitle, DialogContent, TextField, DialogActions, MenuItem
} from '@material-ui/core';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import PhoneIcon from '@material-ui/icons/Phone';
import Rating from '@material-ui/lab/Rating';
import QRCode from 'qrcode.react';
import useStyles from './styles.js';

const FilledBookmarkSVG = ({ size = 24, color = '#FFD700' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
    fill={color}
  >
    <path d="M2 2v13.5a.5.5 0 0 0 .74.439L8 13.069l5.26 2.87A.5.5 0 0 0 14 15.5V2a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/>
  </svg>
);

const OutlineBookmarkSVG = ({ size = 24, color = 'black' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    stroke={color}
    strokeWidth="1.5"
  >
    <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5V2zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.482a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1H4z" />
  </svg>
);

const PlaceDetails = ({ place, selected, refProp, type }) => {
  if (selected) refProp?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  const classes = useStyles();

  const [showQR, setShowQR] = useState(false);
  const [showBookmarkDialog, setShowBookmarkDialog] = useState(false);
  const [bookmarkLists, setBookmarkLists] = useState([]);
  const [selectedLists, setSelectedLists] = useState([]);
  const [showNewListInput, setShowNewListInput] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);

  const baseURL = 'https://www.google.com/maps/place/';
  const qrCodeValue = `${baseURL}${encodeURIComponent(place.address?.replace(/\s/g, '+') || '')}`;

  useEffect(() => {
    const fetchBookmarkData = async () => {
      const token = localStorage.getItem('access_token');

      try {
        // Get lists
        const listRes = await fetch('http://localhost:4000/api/bookmarks/lists', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const listData = await listRes.json();
        const lists = listData.lists || [];
        const allLists = lists.includes('Favourite') ? lists : ['Favourite', ...lists];
        setBookmarkLists(allLists);

        // Get all bookmarks by user
        const bookmarkRes = await fetch('http://localhost:4000/api/bookmarks', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const bookmarkData = await bookmarkRes.json();

        // Find matching bookmarks for this place
        const matchedLists = bookmarkData
          .filter(b => b.name === place.name && b.address === place.address)
          .map(b => b.list);

        setSelectedLists(matchedLists);
        setIsBookmarked(matchedLists.length > 0);
      } catch (error) {
        console.error('Error fetching bookmarks/lists:', error);
      }
    };

    fetchBookmarkData();
  }, [place]);

  const handleAddBookmark = async () => {
    const token = localStorage.getItem('access_token');

    let updatedLists = [...selectedLists];
    if (showNewListInput && newListName.trim()) {
      if (!bookmarkLists.includes(newListName)) {
        setBookmarkLists(prev => [...prev, newListName]);
      }
      updatedLists = [...new Set([...updatedLists, newListName])];
    }

    try {
      // Fetch existing saved bookmarks again
      const res = await fetch('http://localhost:4000/api/bookmarks', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const allBookmarks = await res.json();

      const existingLists = allBookmarks
        .filter(b => b.name === place.name && b.address === place.address)
        .map(b => b.list);

      // Add new bookmarks
      for (const list of updatedLists) {
        if (!existingLists.includes(list)) {
          await fetch('http://localhost:4000/api/bookmarks', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              name: place.name,
              address: place.address,
              web_url: place.web_url,
              list,
            }),
          });
        }
      }

      // Delete bookmarks unchecked
      for (const list of existingLists) {
        if (!updatedLists.includes(list)) {
          await fetch('http://localhost:4000/api/bookmarks', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              name: place.name,
              address: place.address,
              list,
            }),
          });
        }
      }

      // Update state
      setIsBookmarked(updatedLists.length > 0);
      setSelectedLists(updatedLists);
      setShowBookmarkDialog(false);
      setShowNewListInput(false);
      setNewListName('');
    } catch (error) {
      console.error('Error saving/removing bookmarks:', error);
      alert('Failed to update bookmarks');
    }
  };

  return (
    <Card elevation={6}>
      <CardMedia
        style={{ height: 350 }}
        image={place.photo ? place.photo.images.large.url : 'https://www.foodserviceandhospitality.com/wp-content/uploads/2016/09/Restaurant-Placeholder-001.jpg'}
        title={place.name}
      />
      <CardContent>
        <Typography gutterBottom variant="h5">{place.name}</Typography>
        <Box display="flex" justifyContent="space-between">
          <Rating name="read-only" value={Number(place.rating)} readOnly />
          <Typography component="subtitle1">{place.num_reviews} review(s)</Typography>
        </Box>

        <Box display="flex" justifyContent="space-between">
          <Typography variant="subtitle1">Price</Typography>
          <Typography gutterBottom variant="subtitle1">{place.price_level}</Typography>
        </Box>

        <Box display="flex" justifyContent="space-between">
          <Typography variant="subtitle1">Ranking</Typography>
          <Typography gutterBottom variant="subtitle1">{place.ranking}</Typography>
        </Box>

        {place?.awards?.map((award) => (
          <Box key={award.display_name} display="flex" justifyContent="space-between" my={1} alignItems="center">
            <img src={award.images.small} alt="award" />
            <Typography variant="subtitle2" color="textSecondary">{award.display_name}</Typography>
          </Box>
        ))}

        {place?.cuisine?.map(({ name }) => (
          <Chip key={name} size="small" label={name} className={classes.chip} />
        ))}

        {place.address && (
          <Typography gutterBottom variant="body2" color="textSecondary" className={classes.subtitle}>
            <LocationOnIcon /> {place.address}
          </Typography>
        )}

        {place?.phone && (
          <Typography gutterBottom variant="body2" color="textSecondary" className={classes.spacing}>
            <PhoneIcon /> {place.phone}
          </Typography>
        )}
      </CardContent>

      <CardActions>
        <Button size="small" color="primary" onClick={() => window.open(place.web_url, '_blank')}>
          Trip Advisor
        </Button>
        <Button size="small" color="primary" onClick={() => setShowQR(!showQR)}>
          {showQR ? 'Hide QR Code' : 'Navigate there: Show QR Code'}
        </Button>
        <Button size="small" color="secondary" onClick={() => setShowBookmarkDialog(true)} style={{ minWidth: '40px' }}>
          {isBookmarked ? <FilledBookmarkSVG /> : <OutlineBookmarkSVG />}
        </Button>
        {showQR && (
          <div style={{ marginTop: '10px' }}>
            <QRCode value={qrCodeValue} />
          </div>
        )}
      </CardActions>

      {/* Bookmark Dialog */}
      <Dialog open={showBookmarkDialog} onClose={() => {setShowBookmarkDialog(false); setShowNewListInput(false); setNewListName('');}}
      PaperProps={{
        style: {
          width: '400px',
          height: '480px', // Fixed height from the start
          padding: '10px',
        },
      }}>
        <DialogTitle>Save to list</DialogTitle>
        <DialogContent>

          {/* New List Trigger */}
          <Button
            fullWidth
            variant="outlined"
            color="primary"
            onClick={() => {
              setShowNewListInput(true);
              setNewListName('');
            }}
            style={{ marginBottom: '16px', textTransform: 'none' }}
          >
            + New list
          </Button>

          {/* Text Field to enter new list name */}
          {showNewListInput && (
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Enter new list name"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              style={{ marginBottom: '16px' }}
            />
          )}

          {/* List of existing bookmark lists */}
          {bookmarkLists.map((list) => (
            <Box
              key={list}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              borderBottom="1px solid #ddd"
              padding="8px 0"
            >
              <Box display="flex" alignItems="center">
                <Typography variant="body1">{list}</Typography>
              </Box>
              <input
                type="checkbox"
                checked={selectedLists.includes(list)}
                onChange={() => {
                  if (selectedLists.includes(list)) {
                    setSelectedLists(selectedLists.filter((l) => l !== list));
                  } else {
                    setSelectedLists([...selectedLists, list]);
                  }
                }}
              />
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowBookmarkDialog(false)}>Cancel</Button>
          <Button onClick={handleAddBookmark} color="primary" variant="contained">Confirm</Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default PlaceDetails;
