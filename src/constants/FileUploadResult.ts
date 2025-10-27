// Define the structure for a single error
interface IError {
  errorId: number;
  errorMessage: string;
}

// Define the structure for a single order
interface IOrder {
  orderId: number;
  errors: IError[];
}

// Define the overall result structure
interface IResult {
  success: number;
  failed: number;
  orders: IOrder[];
}

// Example usage
export const Result: IResult = {
  success: 100,
  failed: 4,
  orders: [
    {
      orderId: 1,
      errors: [
        {
          errorId: 1,
          errorMessage: 'نحتاج إلى بعض المساعدة. يرجى توضيح ما يلي: ',
        },
        {
          errorId: 2,
          errorMessage: 'يبدو أن العنوان غير مكتمل ',
        },
        {
          errorId: 3,
          errorMessage: 'لا يمكن تحديد السعر',
        },
      ],
    },
    {
      orderId: 2,
      errors: [
        {
          errorId: 1,
          errorMessage: 'نحتاج إلى بعض المساعدة. يرجى توضيح ما يلي: ',
        },
        {
          errorId: 2,
          errorMessage: 'يبدو أن العنوان غير مكتمل ',
        },
        {
          errorId: 3,
          errorMessage: 'لا يمكن تحديد السعر',
        },
      ],
    },
    {
      orderId: 3,
      errors: [
        {
          errorId: 1,
          errorMessage: 'نحتاج إلى بعض المساعدة. يرجى توضيح ما يلي: ',
        },
        {
          errorId: 2,
          errorMessage: 'يبدو أن العنوان غير مكتمل ',
        },
        {
          errorId: 3,
          errorMessage: 'لا يمكن تحديد السعر',
        },
      ],
    },
  ],
};
