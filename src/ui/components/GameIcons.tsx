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
  GiCoffin,
  GiMimicChest,
  GiMagicPotion,
  GiShatteredHeart,
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
export const IconCoffin = (props: IconProps) => <GiCoffin {...props} />;
export const IconMimic = (props: IconProps) => <GiMimicChest {...props} />;
export const IconMagic = (props: IconProps) => <GiMagicPotion {...props} />;
