import React, { useEffect, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import client from '../../../services/restClient';

const StaffListDialog = ({ providerId, visible, onHide }) => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (providerId && visible) {
      setLoading(true);
      client.service('staffinfo').find({ query: { providerId } })
        .then(res => {
          setStaff(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch staff info:', err);
          setLoading(false);
        });
    }
  }, [providerId, visible]);

  return (
    <Dialog header="Provider's Staff" visible={visible} onHide={onHide} style={{ width: '450px' }}>
      {loading ? (
        <p>Loading...</p>
      ) : (
        staff.length > 0 ? (
          <ul>
            {staff.map(s => (
              <li key={s._id}>{s.name} - {s.position} ({s.email})</li>
            ))}
          </ul>
        ) : (
          <p>No staff found for this provider.</p>
        )
      )}
    </Dialog>
  );
};

export default StaffListDialog; 