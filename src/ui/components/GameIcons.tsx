import React from 'react';
import {
  GiGraveFlowers,
  GiGhost,
  GiTombstone,
  GiHealthPotion,
  GiFlame,
  GiMagicBroom,
  GiSpade,
  GiHearts,
  GiMirrorMirror,
  GiMagnifyingGlass,
  GiSkullCrossedBones,
  GiSkullCrack,
  GiCoffin,
  GiMimicChest,
  GiMagicPotion,
  GiShatteredHeart,
  GiBrain,
  GiHamburger,
  GiJellyfish,
  GiCrab,
  GiAnchor,
  GiBubbles,
  GiFishBucket,
  GiFishingNet,
  GiGreekTemple,
  GiOpenBook,
  GiScrollUnfurled,
  GiQuillInk,
  GiCandlebright,
  GiOwl,
  GiWaxSeal,
  GiProcessor,
  GiRetroController,
  GiWireframeGlobe,
  GiCyberEye,
  GiAudioCassette,
  GiSave,
  GiLaserBurst,
} from 'react-icons/gi';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
}

export const IconGrave = (props: IconProps) => <GiGraveFlowers {...props} />;
export const IconGhost = (props: IconProps) => <GiGhost {...props} />;
export const IconTomb = (props: IconProps) => <GiTombstone {...props} />;
export const IconRevive = (props: IconProps) => <GiHealthPotion {...props} />;
export const IconPurge = (props: IconProps) => <GiShatteredHeart {...props} />;
export const IconCremate = (props: IconProps) => <GiFlame {...props} />;
export const IconSweep = (props: IconProps) => <GiMagicBroom {...props} />;
export const IconErect = (props: IconProps) => <GiSpade {...props} />;
export const IconHeart = (props: IconProps) => <GiHearts {...props} />;
export const IconMirror = (props: IconProps) => <GiMirrorMirror {...props} />;
export const IconSearch = (props: IconProps) => <GiMagnifyingGlass {...props} />;
export const IconSkull = (props: IconProps) => <GiSkullCrossedBones {...props} />;
export const IconSkullhead = (props: IconProps) => <GiSkullCrack {...props} />;
export const IconCoffin = (props: IconProps) => <GiCoffin {...props} />;
export const IconMimic = (props: IconProps) => <GiMimicChest {...props} />;
export const IconMagic = (props: IconProps) => <GiMagicPotion {...props} />;
export const IconBrain = (props: IconProps) => <GiBrain {...props} />;

// SpongeBob / Marine icons
export const IconBurger = (props: IconProps) => <GiHamburger {...props} />;
export const IconJellyfish = (props: IconProps) => <GiJellyfish {...props} />;
export const IconCrab = (props: IconProps) => <GiCrab {...props} />;
export const IconAnchor = (props: IconProps) => <GiAnchor {...props} />;
export const IconBubbles = (props: IconProps) => <GiBubbles {...props} />;
export const IconFishBucket = (props: IconProps) => <GiFishBucket {...props} />;
export const IconFishingNet = (props: IconProps) => <GiFishingNet {...props} />;

// Gothic Academy / Classical Library icons
export const IconTemple = (props: IconProps) => <GiGreekTemple {...props} />;
export const IconBook = (props: IconProps) => <GiOpenBook {...props} />;
export const IconScroll = (props: IconProps) => <GiScrollUnfurled {...props} />;
export const IconQuill = (props: IconProps) => <GiQuillInk {...props} />;
export const IconCandle = (props: IconProps) => <GiCandlebright {...props} />;
export const IconOwl = (props: IconProps) => <GiOwl {...props} />;
export const IconWaxSeal = (props: IconProps) => <GiWaxSeal {...props} />;

// Cyberpunk / Vaporwave / 80s Arcade icons
export const IconProcessor = (props: IconProps) => <GiProcessor {...props} />;
export const IconRetroController = (props: IconProps) => <GiRetroController {...props} />;
export const IconWireframeGlobe = (props: IconProps) => <GiWireframeGlobe {...props} />;
export const IconCyberEye = (props: IconProps) => <GiCyberEye {...props} />;
export const IconCassette = (props: IconProps) => <GiAudioCassette {...props} />;
export const IconFloppy = (props: IconProps) => <GiSave {...props} />;
export const IconLaser = (props: IconProps) => <GiLaserBurst {...props} />;

// Corporate / Clean Professional icons
import {
  FiFolder,
  FiLayers,
  FiArchive,
  FiRotateCw,
  FiTrash2,
  FiX,
  FiClock,
  FiInbox,
  FiCheck,
  FiActivity,
  FiGlobe,
  FiSliders,
} from 'react-icons/fi';

export const IconCorpFolder = (props: IconProps) => <FiFolder {...props} />;
export const IconCorpLayers = (props: IconProps) => <FiLayers {...props} />;
export const IconCorpArchive = (props: IconProps) => <FiArchive {...props} />;
export const IconCorpRestore = (props: IconProps) => <FiRotateCw {...props} />;
export const IconCorpTrash = (props: IconProps) => <FiTrash2 {...props} />;
export const IconCorpClose = (props: IconProps) => <FiX {...props} />;
export const IconCorpClock = (props: IconProps) => <FiClock {...props} />;
export const IconCorpInbox = (props: IconProps) => <FiInbox {...props} />;
export const IconCorpCheck = (props: IconProps) => <FiCheck {...props} />;
export const IconCorpActivity = (props: IconProps) => <FiActivity {...props} />;
export const IconCorpGlobe = (props: IconProps) => <FiGlobe {...props} />;
export const IconCorpSliders = (props: IconProps) => <FiSliders {...props} />;
