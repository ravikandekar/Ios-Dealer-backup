import { DirectionsCar, Bycicle, Repairtool, CarBannerImage, BikeBannerImage, SparePartsBannerImage } from "../../public_assets/media";
import Bike from "../IconCompo/Bike";
import Car from "../IconCompo/Car";
import Spare from "../IconCompo/Spare";

export const welcomeCardData = {
  headText: 'Welcome to GADILO Bharat',
  subTitleText: 'Tap to know more about GADILO Bharat.',
  buttonText: 'Lets Start',
  iconName: 'arrow-forward',
  imageName: 'gadiloPhone'
};

export const Subscription = {
  Cars: true,
  Bikes: false,
  'Spare part accessories': false,
};

export const categoryIcons = {
  Car: Car,
  Bike: Bike,
  'Spare Part Accessories': Spare,
};

export const bannerImages = {
  Cars: CarBannerImage,
  Bikes: BikeBannerImage,
  'Spare Part Accessories': SparePartsBannerImage,
};

export const quickListCardData = {
  Car: {
    image: CarBannerImage,
    cardTitle: 'Car Listings',
    cardDescription: 'Looking to sell a car? Add vehicle details in just a few steps and get it in front of interested buyers.',
  },
  Bike: {
    image: BikeBannerImage,
    cardTitle: 'Bike Listings',
    cardDescription: 'List bikes effortlessly. Reach more customers with a platform designed to make selling easy and efficient.',
  },
  'Spare Part Accessories': {
    image: SparePartsBannerImage,
    cardTitle: 'Spare Parts Accessories Listings',
    cardDescription: 'Spares-Accessories to sell? Upload the details and start connecting with potential buyers across the city.',
  },

};

export const overviewStatsData = {
  sold: 12,
  deleted: 6,
};

export const headerUsageData = {
  CarDetails: {
    title: 'Car Details',
    rightType: 'steps',
    stepText: '1/6',
    stepTextBg: '',
    actionText: '',
    actionIcon: '',
  },
  Preview: {
    title: 'Preview',
    rightType: 'action',
    stepText: '',
    actionText: 'Edit',
    actionIcon: 'create-outline',
  },
  MyAssets: {
    title: 'My Assets',
    rightType: 'action',
    stepText: '',
    actionText: 'Add New',
    actionIcon: 'add-circle-outline',
  },
  Settings: {
    title: 'Settings',
    rightType: 'none',
    stepText: '',
    actionText: '',
    actionIcon: '',
  },
};
