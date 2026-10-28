
"use client";

import { useState, useTransition, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { currentUser, type Post, pulseTopics } from '@/lib/data';
import { getHashtagSuggestions } from '@/app/actions';
import { Badge } from './ui/badge';
import { Sparkles, LoaderCircle, Image as ImageIcon, X, MapPin, Music, Mic, PlusCircle, Send, GalleryHorizontal, ChevronRight, ChevronLeft, Tag, Users, User, Activity, Settings2, MessageCircleOff, Hash, Search, Clapperboard, Video } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn, formatDuration } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Separator } from './ui/separator';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel"
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { PostCard } from './post-card';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from './ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from './ui/sheet';
import { ScrollArea, ScrollBar } from './ui/scroll-area';

const trendingSongs = [
  { title: "Starlight", artist: "MUSE" },
  { title: "City of Stars", artist: "La La Land Cast" },
  { title: "Paint It, Black", artist: "The Rolling Stones" },
  { title: "Run Boy Run", artist: "Woodkid" },
  { title: "Island in the Sun", artist: "Weezer" },
];

type PostDestination = 'Story' | 'Profile' | 'Public Pulse';

const MAX_VIDEO_DURATION = 3000; // 50 minutes in seconds
const SHORT_VIDEO_THRESHOLD = 150; // 2 minutes 30 seconds in seconds
const MAX_IMAGES = 20;

export function CreatePost() {
  const [caption, setCaption] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [videoCategory, setVideoCategory] = useState<'short' | 'long' | null>(null);
  
  const [showMusic, setShowMusic] = useState(false);
  const [showHashtags, setShowHashtags] = useState(false);
  const [selectedSong, setSelectedSong] = useState<{ title: string; artist: string } | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)
  const [selectedDestinations, setSelectedDestinations] = useState<Set<PostDestination>>(new Set());
  const [highQuality, setHighQuality] = useState(false);
  const [commentsOff, setCommentsOff] = useState(false);
  const [quotedPost, setQuotedPost] = useState<Post | null>(null);
  const [newHashtag, setNewHashtag] = useState('');
  const [hashtagPurpose, setHashtagPurpose] = useState('');
  const [isHashtagDialogOpen, setIsHashtagDialogOpen] = useState(false);
  
  // Public Pulse Topic States
  const [isPulseTopicDialogOpen, setIsPulseTopicDialogOpen] = useState(false);
  const [publicPulseTopic, setPublicPulseTopic] = useState<string | null>(null);
  const [pulseSearchTerm, setPulseSearchTerm] = useState('');

  useEffect(() => {
    const postToQuote = localStorage.getItem('quote_post');
    if (postToQuote) {
      setQuotedPost(JSON.parse(postToQuote));
      localStorage.removeItem('quote_post');
    }
  }, []);

  useEffect(() => {
    if (!api) {
      return
    }

    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap() + 1)

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1)
    })
  }, [api])


  useEffect(() => {
    const lastWord = caption.split(' ').pop() || '';
    if (lastWord.startsWith('#') && lastWord.length > 1) {
      setShowHashtags(true);
      startTransition(async () => {
        const result = await getHashtagSuggestions(caption);
        setSuggestions(result.hashtags);
      });
    } else {
      setShowHashtags(false);
    }
  }, [caption]);

  const addHashtag = (hashtag: string) => {
    const words = caption.split(' ');
    words.pop(); // remove the partial hashtag
    setCaption(`${words.join(' ')} ${hashtag} `);
  };

  const handleCreateHashtag = () => {
    if (!newHashtag) return;
    const formattedHashtag = `#${newHashtag.replace(/#/g, '')}`;
    addHashtag(formattedHashtag);
    startTransition(async () => {
      const result = await getHashtagSuggestions(caption, hashtagPurpose);
      setSuggestions(result.hashtags);
    });
    setNewHashtag('');
    setHashtagPurpose('');
    setIsHashtagDialogOpen(false);
  }

  const handlePost = () => {
    if (selectedDestinations.size === 0) {
      toast({
        title: 'No destination selected',
        description: 'Please choose where to post your content.',
        variant: 'destructive',
      });
      return;
    }
    if (!caption.trim() && mediaPreviews.length === 0 && !quotedPost) {
      toast({
        title: 'Cannot create an empty post',
        description: 'Please add a caption, media, or a quote.',
        variant: 'destructive',
      });
      return;
    }

    const newPostData: any = {
      user: currentUser,
      caption: caption,
      likes: 0,
      views: 0,
      comments: [],
      timestamp: 'Just now',
      videoUrl: mediaPreviews.length > 0 && mediaType === 'video' ? mediaPreviews[0] : undefined
    };

    if (mediaPreviews.length > 0 && mediaType === 'image') {
        newPostData.images = mediaPreviews.map((url, index) => ({
            id: `img-${Date.now()}-${index}`,
            imageUrl: url,
            description: caption,
            imageHint: 'post'
        }));
        newPostData.image = newPostData.images[0]; // For backward compatibility
    }

    if (selectedDestinations.has('Public Pulse')) {
      const pulsePost = { ...newPostData, id: `pulse-${Date.now()}`, postType: 'public_pulse' };
      const existing = JSON.parse(localStorage.getItem(`pulse_posts_${currentUser.id}`) || '[]');
      localStorage.setItem(`pulse_posts_${currentUser.id}`, JSON.stringify([pulsePost, ...existing]));
    }

    if (selectedDestinations.has('Profile')) {
      const profilePost = { ...newPostData, id: `post-${Date.now()}`, postType: 'profile' };
      const existing = JSON.parse(localStorage.getItem(`profile_posts_${currentUser.id}`) || '[]');
      localStorage.setItem(`profile_posts_${currentUser.id}`, JSON.stringify([profilePost, ...existing]));
    }
    
    window.dispatchEvent(new Event('storage'));

    const destinations = Array.from(selectedDestinations).join(', ');
    toast({
      title: 'Post Created!',
      description: `Your post has been successfully published to ${destinations}. ${publicPulseTopic ? `Topic: ${publicPulseTopic}` : ''}`,
    });
    setCaption('');
    setSuggestions([]);
    setMediaPreviews([]);
    setMediaType(null);
    setVideoDuration(null);
    setVideoCategory(null);
    setSelectedSong(null);
    setShowMusic(false);
    setLocation(null);
    setSelectedDestinations(new Set());
    setQuotedPost(null);
    setPublicPulseTopic(null);
  };

  const handleIconClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      if (files.length > 1 && Array.from(files).some(f => f.type.startsWith('video'))) {
          toast({
              title: "Invalid Selection",
              description: "You can only upload one video at a time.",
              variant: "destructive",
          });
          return;
      }

      if (files.length > MAX_IMAGES) {
          toast({
              title: "Limit Exceeded",
              description: `You can upload up to ${MAX_IMAGES} images at once.`,
              variant: "destructive",
          });
          return;
      }
      
      const file = files[0];

      if (file.type.startsWith('video')) {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
          window.URL.revokeObjectURL(video.src);
          const duration = video.duration;
          
          if (duration > MAX_VIDEO_DURATION) {
            toast({
              title: "Video Too Long",
              description: "The maximum duration for long-form video is 50 minutes.",
              variant: "destructive",
            });
            removeMedia();
            return;
          }

          setVideoDuration(duration);
          setVideoCategory(duration <= SHORT_VIDEO_THRESHOLD ? 'short' : 'long');
          setMediaType('video');
          
          const reader = new FileReader();
          reader.onload = (e) => {
              setMediaPreviews([e.target?.result as string]);
          };
          reader.readAsDataURL(file);
        };
        video.src = URL.createObjectURL(file);
      } else {
        setMediaType('image');
        if(files.length > 1) { // Multiple images
          const newPreviews: string[] = [];
          Array.from(files).forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              newPreviews[index] = e.target?.result as string;
              // Check if all files have been read
              if (newPreviews.filter(p => p !== undefined).length === files.length) {
                setMediaPreviews(newPreviews);
              }
            };
            reader.readAsDataURL(file);
          });
        } else { // Single image
          const reader = new FileReader();
          reader.onload = (e) => {
              setMediaPreviews([e.target?.result as string]);
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  const removeMedia = () => {
    setMediaPreviews([]);
    setMediaType(null);
    setVideoDuration(null);
    setVideoCategory(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }

  const handleSelectSong = (song: { title: string; artist: string }) => {
    setSelectedSong(song);
    setShowMusic(false);
  }

  const handleAddLocation = () => {
    setLocation("San Francisco, CA");
    toast({
      title: "Location Added",
      description: "Your location has been added to the post.",
    });
  };

  const handleTagPeople = () => {
    toast({
      title: "Feature Coming Soon",
      description: "You'll be able to tag people in your posts soon!",
    });
  };

  const handleToggleDestination = (destination: PostDestination) => {
    if (destination === 'Public Pulse' && !selectedDestinations.has('Public Pulse')) {
      setIsPulseTopicDialogOpen(true);
      return;
    }

    setSelectedDestinations(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(destination)) {
        newSelection.delete(destination);
        if (destination === 'Public Pulse') {
            setPublicPulseTopic(null);
        }
      } else {
        newSelection.add(destination);
      }
      return newSelection;
    });
  };

  const handleSelectPulseTopic = (topic: string) => {
    setPublicPulseTopic(topic);
    setSelectedDestinations(prev => {
      const newSelection = new Set(prev);
      newSelection.add('Public Pulse');
      return newSelection;
    });
    setIsPulseTopicDialogOpen(false);
    setPulseSearchTerm('');
  };

  const isContentAdded = !!caption.trim() || mediaPreviews.length > 0 || !!quotedPost;

  const destinationOptions: { name: PostDestination; icon: React.ElementType }[] = [
    { name: 'Story', icon: PlusCircle },
    { name: 'Profile', icon: User },
    { name: 'Public Pulse', icon: Activity },
  ];

  const filteredPulseTopics = pulseTopics.filter(t => 
    t.title.toLowerCase().includes(pulseSearchTerm.toLowerCase())
  );

  return (
    <>
    <Card className="border-none shadow-none bg-transparent">
      <CardContent className="px-4 py-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={currentUser.avatar.imageUrl} alt={currentUser.name} data-ai-hint={currentUser.avatar.imageHint} />
            <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <Textarea
            placeholder="What's on your mind?"
            className="flex-1 border-none focus-visible:ring-0 shadow-none text-base bg-transparent p-0 rounded-none min-h-[150px] resize-none"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
        </div>

        {quotedPost && (
            <div className="mt-4 border rounded-2xl overflow-hidden relative bg-accent/5">
                <div className="p-3">
                    <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5 border">
                            <AvatarImage src={quotedPost.user.avatar.imageUrl} alt={quotedPost.user.name} data-ai-hint={quotedPost.user.avatar.imageHint} />
                            <AvatarFallback>{quotedPost.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-bold text-xs">{quotedPost.user.name}</span>
                        <span className="text-[10px] text-muted-foreground">@{quotedPost.user.id}</span>
                    </div>
                    <p className="text-sm mt-1.5 leading-relaxed">{quotedPost.caption}</p>
                </div>
                {(quotedPost.image || quotedPost.videoUrl) && (
                     <div className="relative w-full aspect-video bg-black">
                        {quotedPost.videoUrl ? (
                            <video src={quotedPost.videoUrl} className="w-full h-full object-contain" />
                        ) : quotedPost.image && (
                            <Image 
                              src={quotedPost.image.imageUrl} 
                              alt={quotedPost.image.description} 
                              fill 
                              className="object-cover" 
                              data-ai-hint={quotedPost.image.imageHint} 
                            />
                        )}
                    </div>
                )}
                 <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-sm" onClick={() => setQuotedPost(null)}>
                    <X className="h-3.5 w-3.5" />
                 </Button>
            </div>
        )}

        <Separator className="my-4" />

        <div className="relative mb-4">
          {mediaPreviews.length > 0 && (
            <div className="relative w-full aspect-[4/5] rounded-lg overflow-hidden bg-black">
              {mediaType === 'video' ? (
                <div className="relative w-full h-full">
                  <video src={mediaPreviews[0]} controls className="w-full h-full object-contain" />
                  {videoCategory && (
                    <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                      <Badge className={cn(
                        "font-bold text-[10px] uppercase border-none shadow-lg",
                        videoCategory === 'short' ? "bg-primary text-primary-foreground" : "bg-orange-500 text-white"
                      )}>
                        {videoCategory === 'short' ? <Clapperboard className="h-2.5 w-2.5 mr-1" /> : <Video className="h-2.5 w-2.5 mr-1" />}
                        {videoCategory === 'short' ? 'Short Video' : 'Long Video'}
                      </Badge>
                      {videoDuration && (
                        <Badge variant="secondary" className="font-mono text-[9px] w-fit shadow-lg backdrop-blur-md bg-black/40 text-white border-white/20">
                          {formatDuration(videoDuration)}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              ) : mediaPreviews.length === 1 ? (
                 <Image src={mediaPreviews[0]} alt="Preview" layout='fill' className="object-cover" />
              ) : (
                <Carousel setApi={setApi} className="w-full h-full">
                  <CarouselContent>
                    {mediaPreviews.map((src, index) => (
                      <CarouselItem key={index}>
                        <div className="relative w-full h-full aspect-[4/5]">
                          <Image src={src} alt={`Preview ${index + 1}`} layout='fill' className="object-cover" />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-2" />
                  <CarouselNext className="right-2" />
                  {count > 1 && (
                     <div className="absolute top-2 right-2 bg-black/50 text-white text-xs rounded-full px-2 py-1">
                        {current}/{count}
                    </div>
                  )}
                </Carousel>
              )}
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6 rounded-full bg-black/50 hover:bg-black/70 z-20"
                onClick={removeMedia}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>

        <ScrollArea className="w-full whitespace-nowrap mt-2">
          <div className="flex w-max items-center gap-1 pb-2">
            <Button 
                variant="ghost" 
                size="icon" 
                className={cn("h-10 w-10 rounded-full", mediaPreviews.length > 0 ? "text-primary bg-primary/10" : "text-muted-foreground")}
                onClick={handleIconClick}
            >
                <ImageIcon className="h-5 w-5" />
            </Button>

            <Button 
                variant="ghost" 
                size="icon" 
                className={cn("h-10 w-10 rounded-full", location ? "text-primary bg-primary/10" : "text-muted-foreground")}
                onClick={handleAddLocation}
            >
                <MapPin className="h-5 w-5" />
            </Button>

            <Button 
                variant="ghost" 
                size="icon" 
                className={cn("h-10 w-10 rounded-full", selectedSong ? "text-primary bg-primary/10" : "text-muted-foreground")}
                onClick={() => setShowMusic(true)}
            >
                <Music className="h-5 w-5" />
            </Button>

            <Dialog open={isHashtagDialogOpen} onOpenChange={setIsHashtagDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-muted-foreground">
                        <Hash className="h-5 w-5" />
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create a new hashtag</DialogTitle>
                        <DialogDescription>
                            Create a unique hashtag and tell us its purpose so we can provide better suggestions in the future.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="hashtag" className="text-right">Hashtag</Label>
                            <Input id="hashtag" value={newHashtag} onChange={(e) => setNewHashtag(e.target.value)} className="col-span-3" placeholder="e.g., SummerVibes2024" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="purpose" className="text-right">Purpose</Label>
                            <Textarea id="purpose" value={hashtagPurpose} onChange={(e) => setHashtagPurpose(e.target.value)} className="col-span-3" placeholder="e.g., A hashtag for all my summer vacation pictures this year." />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleCreateHashtag}>Create and Add Hashtag</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-muted-foreground" onClick={handleTagPeople}>
                <Tag className="h-5 w-5" />
            </Button>

            <Button 
                variant="ghost" 
                size="icon" 
                className={cn("h-10 w-10 rounded-full", highQuality ? "text-primary bg-primary/10" : "text-muted-foreground")}
                onClick={() => setHighQuality(!highQuality)}
            >
                <Settings2 className="h-5 w-5" />
            </Button>

            <Button 
                variant="ghost" 
                size="icon" 
                className={cn("h-10 w-10 rounded-full", commentsOff ? "text-primary bg-primary/10" : "text-muted-foreground")}
                onClick={() => setCommentsOff(!commentsOff)}
            >
                <MessageCircleOff className="h-5 w-5" />
            </Button>
          </div>
          <ScrollBar orientation="horizontal" className="invisible" />
        </ScrollArea>
        
        {showHashtags && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold mb-2">Suggested Hashtags</h3>
            {(isPending || suggestions.length > 0) ? (
              <div className="flex flex-wrap items-center gap-2">
                <Sparkles className="h-4 w-4 text-yellow-500" />
                {isPending && <LoaderCircle className="animate-spin h-4 w-4" />}
                {suggestions.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer hover:bg-primary/20"
                    onClick={() => addHashtag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Start typing your caption to get suggestions.</p>
            )}
            <Button variant="link" className="p-0 h-auto text-sm mt-2 font-bold" onClick={() => setIsHashtagDialogOpen(true)}>
              Create your own hashtag
            </Button>
          </div>
        )}

        {showMusic && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold mb-2">Trending Music</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto no-scrollbar">
              {trendingSongs.map((song) => (
                <div key={song.title} className="flex items-center justify-between p-2 rounded-md hover:bg-muted cursor-pointer transition-colors" onClick={() => handleSelectSong(song)}>
                  <div>
                    <p className="text-sm font-medium">{song.title}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">{song.artist}</p>
                  </div>
                  <Music className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
       <CardFooter className="flex-col items-start gap-4 p-3">
        <input 
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*,video/*"
            onChange={handleFileChange}
            multiple={mediaType !== 'video'}
        />
        <div className="w-full space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Choose where to post:</p>
            <div className="flex flex-col gap-2 w-full">
              {destinationOptions.map(({ name, icon: Icon }) => (
                <div 
                  key={name}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border",
                    !isContentAdded && "cursor-not-allowed opacity-50",
                    selectedDestinations.has(name) ? "bg-primary/5 border-primary/20" : "hover:bg-muted border-transparent"
                  )}
                  onClick={() => isContentAdded && handleToggleDestination(name)}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={cn("h-5 w-5", selectedDestinations.has(name) ? "text-primary" : "text-muted-foreground")} />
                    <div className="flex flex-col">
                        <span className={cn("text-sm font-bold", selectedDestinations.has(name) && "text-primary")}>{name}</span>
                        {name === 'Public Pulse' && selectedDestinations.has('Public Pulse') && publicPulseTopic && (
                            <span className="text-[10px] text-primary font-bold uppercase animate-in fade-in slide-in-from-left-1 tracking-wider">{publicPulseTopic}</span>
                        )}
                    </div>
                  </div>
                  <Checkbox 
                    checked={selectedDestinations.has(name)} 
                    disabled={!isContentAdded}
                    onCheckedChange={() => isContentAdded && handleToggleDestination(name)}
                  />
                </div>
              ))}
            </div>
        </div>

        <Button 
          size="lg"
          disabled={!isContentAdded || selectedDestinations.size === 0}
          onClick={handlePost}
          className={cn("w-full rounded-xl font-bold transition-all", (isContentAdded && selectedDestinations.size > 0) && 'shadow-lg shadow-primary/40')}
          style={(isContentAdded && selectedDestinations.size > 0) ? { boxShadow: '0 4px 15px hsl(var(--primary) / 0.4)' } : {}}
        >
          Post {selectedDestinations.size > 0 ? `to ${selectedDestinations.size}` : ''}
          <Send className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>

      {/* Public Pulse Topic Selection Sheet */}
      <Sheet open={isPulseTopicDialogOpen} onOpenChange={setIsPulseTopicDialogOpen}>
          <SheetContent side="bottom" className="h-[80vh] flex flex-col p-0 overflow-hidden rounded-t-3xl border-none shadow-2xl fixed z-[60]">
              <div className="mx-auto w-12 h-1.5 bg-muted rounded-full mt-3 mb-1 shrink-0" />
              <SheetHeader className="p-6 pb-2">
                  <SheetTitle className="text-xl font-bold text-left">Select a Topic</SheetTitle>
                  <p className="text-sm text-muted-foreground text-left">
                      Public Pulse posts must be assigned to a specific topic in your universe.
                  </p>
              </SheetHeader>
              <div className="px-6 py-2 shrink-0">
                  <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Search all topics..." 
                        className="pl-9 h-11 bg-accent/50 border-none rounded-xl"
                        value={pulseSearchTerm}
                        onChange={(e) => setPulseSearchTerm(e.target.value)}
                      />
                  </div>
              </div>
              <ScrollArea className="flex-1">
                  <div className="px-6 py-4 space-y-1">
                      {filteredPulseTopics.map((topic) => (
                          <div 
                              key={topic.title}
                              className="p-3 rounded-xl hover:bg-primary/5 cursor-pointer transition-colors active:scale-[0.98] group"
                              onClick={() => handleSelectPulseTopic(topic.title)}
                          >
                              <p className="text-sm font-bold group-hover:text-primary transition-colors">{topic.title}</p>
                              {topic.description && (
                                  <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{topic.description}</p>
                              )}
                          </div>
                      ))}
                      {filteredPulseTopics.length === 0 && (
                          <div className="py-20 text-center text-muted-foreground">
                              <p>No topics found.</p>
                          </div>
                      )}
                  </div>
              </ScrollArea>
              <SheetFooter className="p-4 border-t bg-background shrink-0">
                  <Button variant="ghost" className="w-full font-bold" onClick={() => setIsPulseTopicDialogOpen(false)}>
                      Cancel
                  </Button>
              </SheetFooter>
          </SheetContent>
      </Sheet>
    </Card>
    </>
  );
}
