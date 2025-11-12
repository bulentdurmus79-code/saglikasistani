
import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Role } from '../types';

export const SOSButton: React.FC = () => {
  const { familyGroup, currentUserId } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleSOS = () => {
    setIsLoading(true);
    const currentUser = familyGroup?.profiles.find(p => p.id === currentUserId);
    const caregivers = familyGroup?.profiles.filter(p => p.role === Role.Caregiver);
    const targetCaregiver = caregivers && caregivers.length > 0 ? caregivers[0] : null;

    if (!currentUser || !targetCaregiver) {
      alert("Acil durum kişisi (Bakım Veren) bulunamadı.");
      setIsLoading(false);
      return;
    }

    const sendAlert = (position?: GeolocationPosition) => {
      const lat = position?.coords.latitude;
      const lon = position?.coords.longitude;
      const mapsLink = lat && lon ? `https://www.google.com/maps?q=${lat},${lon}` : "Konum alınamadı.";
      
      const message = encodeURIComponent(
        `ACİL DURUM! ${currentUser.name} yardıma ihtiyaç duyuyor.\nKonum: ${mapsLink}`
      );
      
      // In a real app, you'd get the phone number from the profile
      const phoneNumber = "1234567890"; // Placeholder phone number

      // Send WhatsApp message
      window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
      
      // Initiate phone call
      window.location.href = `tel:${phoneNumber}`;

      setIsLoading(false);
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        sendAlert,
        (error) => {
          console.warn("Could not get location for SOS:", error.message);
          // Send alert without location
          sendAlert();
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      console.warn("Geolocation is not supported by this browser.");
      sendAlert();
    }
  };

  return (
    <button
      onClick={handleSOS}
      disabled={isLoading}
      className="fixed bottom-24 right-4 z-40 w-20 h-20 bg-danger text-white rounded-full flex flex-col items-center justify-center shadow-2xl animate-pulse-red focus:outline-none focus:ring-4 focus:ring-red-400"
      aria-label="Acil Durum SOS"
    >
      {isLoading ? (
        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      ) : (
        <>
          <span className="text-2xl font-bold">SOS</span>
          <span className="text-xs">ACİL</span>
        </>
      )}
    </button>
  );
};
