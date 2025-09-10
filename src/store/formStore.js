// store/formStore.js
import { create } from 'zustand';

// Define a reusable initial form state
const initialFormState = {
  // Global variables
  subscription_plan: '',
  city_id: '',
  category_id: '',
  otherbrand: '',
  carAndbike_other_text: '',
  subscriptionActive: false,
  forceUpdateObject: {},
  isEdit: false,
  isEditSpare: false,
  carandbikeproductid: '',
  isSubscriberRequired:false,




  carAndBikeBrandId: '',
  carandBikeId: '',
  transmissionId: '',
  fuelTypeId: '',
  carColorId: '',
  ownerHistoryId: '',
  yearId: '',
  model_name: '',
  price: '',
  kmsDriven: '',
  images: [], // array of image objects
  isPublished: false,
  //bike
  bikeTypeId: '',


  // spare part
  spareConditionId: '',
  spareproductid: '',
  spareProductTypeId: '',
  listing_id: '',
  subproducttypeId: '',
  SpareBrandId: '',
  SparePartNameId: '',
  SpareyearId: '',
  Spareyear_of_manufacture: '',
  Sparename: '',
  Sparedescription: '',
  Spareprice: '',
  Sparebrand_other_text: '',
  Sparemodel_other_text: '',


};

export const useFormStore = create((set) => ({
  formData: { ...initialFormState },

  // Update a specific field
  updateForm: (key, value) => {
    console.log(`📝 updateForm: Setting '${key}' to`, value);
    set((state) => ({
      formData: {
        ...state.formData,
        [key]: value,
      },
    }));
  },

  // Replace entire form data
  setFormData: (data) => {
    console.log('📦 setFormData: Replacing entire formData with', data);
    set(() => ({ formData: data }));
  },

  clearFields: (fields) => {
    console.log('🧹 clearFields: Resetting specific fields:', fields);
    set((state) => {
      const updatedForm = { ...state.formData };
      fields.forEach((field) => {
        if (Array.isArray(initialFormState[field])) {
          updatedForm[field] = [];
        } else if (typeof initialFormState[field] === 'boolean') {
          updatedForm[field] = initialFormState[field];
        } else {
          updatedForm[field] = '';
        }
      });
      return { formData: updatedForm };
    });
  },

}));
