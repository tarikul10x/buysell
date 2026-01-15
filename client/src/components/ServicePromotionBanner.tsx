import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function ServicePromotionBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const handleJoinTelegram = () => {
    window.open('https://t.me/genz_international', '_blank');
  };

  const handleWhatsApp = () => {
    window.open('https://wa.me/8801946716608', '_blank');
  };

  return (
    <div className="fixed bottom-20 right-4 lg:bottom-4 z-40">
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl p-4 max-w-sm shadow-2xl">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold">Gen Z International</h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="text-white/70 hover:text-white p-0 w-auto h-auto"
            data-testid="button-close-banner"
          >
            <i className="fas fa-times"></i>
          </Button>
        </div>
        <p className="text-sm opacity-90 mb-3">Join our Telegram channel for updates and exclusive offers!</p>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleJoinTelegram}
            className="flex-1 bg-white/20 text-white py-2 px-3 rounded-lg text-sm hover:bg-white/30"
            data-testid="button-join-telegram"
          >
            <i className="fab fa-telegram mr-1"></i>
            Join Channel
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleWhatsApp}
            className="bg-white/20 text-white py-2 px-3 rounded-lg text-sm hover:bg-white/30"
            data-testid="button-contact-whatsapp"
          >
            <i className="fab fa-whatsapp"></i>
          </Button>
        </div>
      </div>
    </div>
  );
}
