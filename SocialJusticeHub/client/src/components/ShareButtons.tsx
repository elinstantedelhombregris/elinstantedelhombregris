import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Share2, 
  Twitter, 
  Facebook, 
  Linkedin, 
  MessageCircle, 
  Link as LinkIcon,
  Copy,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
  hashtags?: string[];
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  showLabel?: boolean;
  className?: string;
}

export default function ShareButtons({
  url,
  title,
  description = '',
  hashtags = ['ElHombreGris', 'Transformación', 'Argentina'],
  size = 'md',
  variant = 'outline',
  showLabel = true,
  className = ''
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const buttonSize = size === 'md' ? 'default' : size;

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const shareData = {
    url,
    title,
    text: description,
    hashtags: hashtags.join(',')
  };

  const handleShare = async (platform: string) => {
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    const encodedDescription = encodeURIComponent(description);
    const encodedHashtags = encodeURIComponent(hashtags.join(' '));

    let shareUrl = '';

    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}&hashtags=${encodedHashtags}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      toast({
        title: "¡Enlace copiado!",
        description: "El enlace ha sido copiado al portapapeles",
        duration: 2000,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo copiar el enlace",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share(shareData);
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    } else {
      // Fallback to copy link
      handleCopyLink();
    }
  };

  const ShareButton = ({ 
    onClick, 
    icon: Icon, 
    label, 
    className: buttonClassName = '' 
  }: {
    onClick: () => void;
    icon: React.ComponentType<any>;
    label: string;
    className?: string;
  }) => (
    <motion.button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg
        hover:bg-gray-100 transition-colors duration-200
        ${buttonClassName}
      `}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Icon className={iconSizes[size]} />
      <span className={textSizes[size]}>{label}</span>
    </motion.button>
  );

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Native share button for mobile */}
      {typeof navigator !== 'undefined' && 'share' in navigator && (
        <Button
          variant={variant}
          size={buttonSize}
          onClick={handleNativeShare}
          className="flex items-center gap-2"
        >
          <Share2 className={iconSizes[size]} />
          {showLabel && <span className={textSizes[size]}>Compartir</span>}
        </Button>
      )}

      {/* Desktop share options */}
      {!(typeof navigator !== 'undefined' && 'share' in navigator) && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={variant}
              size={buttonSize}
              className="flex items-center gap-2"
            >
              <Share2 className={iconSizes[size]} />
              {showLabel && <span className={textSizes[size]}>Compartir</span>}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => handleShare('twitter')}>
              <Twitter className="w-4 h-4 mr-2 text-blue-400" />
              Twitter
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleShare('facebook')}>
              <Facebook className="w-4 h-4 mr-2 text-blue-600" />
              Facebook
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleShare('linkedin')}>
              <Linkedin className="w-4 h-4 mr-2 text-blue-700" />
              LinkedIn
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleShare('whatsapp')}>
              <MessageCircle className="w-4 h-4 mr-2 text-green-500" />
              WhatsApp
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleCopyLink}>
              {copied ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="w-4 h-4 mr-2 text-green-500"
                >
                  <Check className="w-4 h-4" />
                </motion.div>
              ) : (
                <motion.div
                  key="copy"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="w-4 h-4 mr-2"
                >
                  <LinkIcon className="w-4 h-4" />
                </motion.div>
              )}
              {copied ? '¡Copiado!' : 'Copiar enlace'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Individual share buttons for expanded view */}
      <div className="hidden md:flex items-center gap-2">
        <ShareButton
          onClick={() => handleShare('twitter')}
          icon={Twitter}
          label="Twitter"
          className="text-blue-400 hover:text-blue-500 hover:bg-blue-50"
        />
        <ShareButton
          onClick={() => handleShare('facebook')}
          icon={Facebook}
          label="Facebook"
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        />
        <ShareButton
          onClick={() => handleShare('linkedin')}
          icon={Linkedin}
          label="LinkedIn"
          className="text-blue-700 hover:text-blue-800 hover:bg-blue-50"
        />
        <ShareButton
          onClick={() => handleShare('whatsapp')}
          icon={MessageCircle}
          label="WhatsApp"
          className="text-green-500 hover:text-green-600 hover:bg-green-50"
        />
        <motion.button
          onClick={handleCopyLink}
          className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {copied ? (
            <motion.div
              key="check"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              className="w-5 h-5 text-green-500"
            >
              <Check className="w-5 h-5" />
            </motion.div>
          ) : (
            <motion.div
              key="copy"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="w-5 h-5"
            >
              <Copy className="w-5 h-5" />
            </motion.div>
          )}
          <span className={textSizes[size]}>
            {copied ? '¡Copiado!' : 'Copiar'}
          </span>
        </motion.button>
      </div>
    </div>
  );
}

// Floating share buttons for mobile
export function FloatingShareButtons({
  url,
  title,
  description,
  hashtags,
  className = ''
}: Omit<ShareButtonsProps, 'size' | 'variant' | 'showLabel'>) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="mb-4 space-y-2"
          >
            <ShareButtons
              url={url}
              title={title}
              description={description}
              hashtags={hashtags}
              size="lg"
              showLabel={false}
              className="flex flex-col gap-2"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{ rotate: isOpen ? 45 : 0 }}
      >
        <Share2 className="w-6 h-6" />
      </motion.button>
    </div>
  );
}
