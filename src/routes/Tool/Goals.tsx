import { useToolStore } from '@/stores/useToolStore';
import { SelectionCard } from '@jod/design-system';
import { useTranslation } from 'react-i18next';

const SomethingElseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="80" height="99" viewBox="0 0 80 99" fill="none">
    <path
      d="M47.7166 61.864C47.103 61.864 46.6144 61.4095 46.6144 60.7958V60.7163C46.6144 60.6367 46.6257 60.5572 46.6371 60.489C47.1371 58.1367 48.6144 56.0686 50.7848 54.6481C57.9553 50.0118 61.2961 41.5689 59.3186 33.1485C57.6141 25.8532 51.5346 19.955 44.1935 18.4554C38.1935 17.2281 32.091 18.694 27.4437 22.4895C22.7847 26.285 20.1143 31.9215 20.1143 37.9324C20.1143 44.7051 23.4892 50.9208 29.1484 54.5688C29.1825 54.5915 29.228 54.6256 29.2621 54.6483C30.7734 55.9211 32.8302 57.8984 33.3416 60.5006C33.4553 61.1029 33.0689 61.6824 32.478 61.796C31.8871 61.9096 31.2962 61.5233 31.1826 60.9324C30.8076 59.046 29.1485 57.4324 27.8985 56.3869C21.6485 52.3301 17.9102 45.4328 17.9102 37.9324C17.9102 31.2619 20.876 25.0117 26.0469 20.7848C31.206 16.5688 37.9785 14.9325 44.6374 16.2961C52.7967 17.9552 59.5691 24.5347 61.4672 32.6481C63.6604 41.9892 59.9331 51.3528 51.9902 56.5005C50.3197 57.5914 49.1947 59.1595 48.8083 60.9209C48.7061 61.455 48.2515 61.8641 47.7174 61.8641L47.7166 61.864Z"
      fill="black"
    />
    <path
      d="M47.7064 73.1023H32.1726C31.5589 73.1023 31.0703 72.6137 31.0703 72.0001V60.739C31.0703 60.1253 31.559 59.6367 32.1726 59.6367H47.7064C48.32 59.6367 48.8086 60.1254 48.8086 60.739V72.0001C48.8086 72.6023 48.32 73.1023 47.7064 73.1023ZM33.2744 70.8978H46.6038V61.8411H33.2744V70.8978Z"
      fill="black"
    />
    <path
      d="M47.7064 67.4662H32.1726C31.5589 67.4662 31.0703 66.9776 31.0703 66.364C31.0703 65.7504 31.559 65.2617 32.1726 65.2617H47.7064C48.32 65.2617 48.8086 65.7504 48.8086 66.364C48.8086 66.9776 48.32 67.4662 47.7064 67.4662Z"
      fill="black"
    />
    <path
      d="M39.9897 80.0011C36.501 80.0011 33.6602 77.1488 33.6602 73.6374V72.0124C33.6602 71.3988 34.1488 70.9102 34.7624 70.9102C35.376 70.9102 35.8647 71.3988 35.8647 72.0124V73.6374C35.8647 75.9328 37.717 77.7966 39.9897 77.7966C42.2851 77.7966 44.1488 75.9329 44.1488 73.6374V72.0124C44.1488 71.3988 44.6375 70.9102 45.2511 70.9102C45.8647 70.9102 46.3533 71.3988 46.3533 72.0124V73.6374C46.3533 77.1488 43.501 80.0011 39.9897 80.0011Z"
      fill="black"
    />
    <path
      d="M33.398 40.0695C30.9776 40.0695 29.0117 38.1036 29.0117 35.6832C29.0117 33.2628 30.9776 31.2969 33.398 31.2969C35.8185 31.2969 37.7844 33.2628 37.7844 35.6832C37.7844 38.1036 35.8185 40.0695 33.398 40.0695ZM33.398 33.5014C32.1935 33.5014 31.2162 34.4787 31.2162 35.6832C31.2162 36.8877 32.1935 37.865 33.398 37.865C34.6026 37.865 35.5799 36.8877 35.5799 35.6832C35.5799 34.4787 34.6026 33.5014 33.398 33.5014Z"
      fill="black"
    />
    <path
      d="M36.6941 61.8312C36.0804 61.8312 35.5918 61.3426 35.5918 60.7289V38.9675C35.5918 38.3539 36.0804 37.8652 36.6941 37.8652C37.3077 37.8652 37.7963 38.3539 37.7963 38.9675V60.7289C37.7963 61.3426 37.3077 61.8312 36.6941 61.8312Z"
      fill="black"
    />
    <path
      d="M46.5465 40.0695C44.126 40.0695 42.1602 38.1036 42.1602 35.6832C42.1602 33.2628 44.126 31.2969 46.5465 31.2969C48.9669 31.2969 50.9328 33.2628 50.9328 35.6832C50.9328 38.1036 48.9669 40.0695 46.5465 40.0695ZM46.5465 33.5014C45.342 33.5014 44.3647 34.4787 44.3647 35.6832C44.3647 36.8877 45.342 37.865 46.5465 37.865C47.751 37.865 48.7283 36.8877 48.7283 35.6832C48.7283 34.4787 47.751 33.5014 46.5465 33.5014Z"
      fill="black"
    />
    <path
      d="M46.5468 40.0697H33.3991C32.7855 40.0697 32.2969 39.5811 32.2969 38.9675C32.2969 38.3539 32.7855 37.8652 33.3991 37.8652H46.5468C47.1604 37.8652 47.649 38.3539 47.649 38.9675C47.649 39.5811 47.149 40.0697 46.5468 40.0697Z"
      fill="black"
    />
    <path
      d="M43.239 61.8312C42.6253 61.8312 42.1367 61.3426 42.1367 60.7289V38.9675C42.1367 38.3539 42.6254 37.8652 43.239 37.8652C43.8526 37.8652 44.3412 38.3539 44.3412 38.9675V60.7289C44.3412 61.3426 43.8526 61.8312 43.239 61.8312Z"
      fill="black"
    />
    <path
      d="M40.0007 14.2393C39.3871 14.2393 38.8984 13.7507 38.8984 13.1371V8.37569C38.8984 7.76206 39.3871 7.27344 40.0007 7.27344C40.6143 7.27344 41.1029 7.76208 41.1029 8.37569V13.1371C41.1029 13.7507 40.6143 14.2393 40.0007 14.2393Z"
      fill="black"
    />
    <path
      d="M27.4899 17.6378C27.1035 17.6378 26.7399 17.4447 26.5353 17.0924L24.149 12.9674C23.8422 12.4446 24.024 11.7629 24.5581 11.4674C25.0808 11.1606 25.7626 11.3424 26.0581 11.8765L28.4444 16.0015C28.7513 16.5242 28.5694 17.206 28.0353 17.5015C27.8649 17.5924 27.6831 17.6378 27.4899 17.6378Z"
      fill="black"
    />
    <path
      d="M17.9887 27.0456C17.8068 27.0456 17.6137 27.0001 17.4432 26.8979L13.3182 24.5115C12.7955 24.2047 12.6136 23.5342 12.9091 23.0115C13.2159 22.4888 13.8864 22.307 14.4091 22.6025L18.5341 24.9888C19.0568 25.2956 19.2387 25.9661 18.9432 26.4888C18.7387 26.8524 18.375 27.0456 17.9887 27.0456Z"
      fill="black"
    />
    <path
      d="M14.4672 39.9447H9.70577C9.09213 39.9447 8.60352 39.4561 8.60352 38.8425C8.60352 38.2289 9.09216 37.7402 9.70577 37.7402H14.4672C15.0808 37.7402 15.5694 38.2289 15.5694 38.8425C15.5694 39.4561 15.0808 39.9447 14.4672 39.9447Z"
      fill="black"
    />
    <path
      d="M13.7403 55.2624C13.3539 55.2624 12.9903 55.0693 12.7857 54.717C12.4789 54.1943 12.6607 53.5125 13.1948 53.217L17.3198 50.8307C17.8426 50.5238 18.5244 50.7057 18.8198 51.2397C19.1267 51.7625 18.9448 52.4443 18.4108 52.7397L14.2857 55.1261C14.1153 55.2056 13.9221 55.2624 13.7403 55.2624Z"
      fill="black"
    />
    <path
      d="M52.5121 17.6378C52.3303 17.6378 52.1371 17.5923 51.9666 17.4901C51.4439 17.1833 51.2621 16.5128 51.5575 15.9901L53.9439 11.8651C54.2507 11.3423 54.9212 11.1605 55.4439 11.456C55.9666 11.7628 56.1484 12.4333 55.8529 12.956L53.4666 17.081C53.2621 17.4446 52.8871 17.6378 52.5121 17.6378Z"
      fill="black"
    />
    <path
      d="M62.0118 27.0456C61.6254 27.0456 61.2618 26.8525 61.0572 26.5002C60.7504 25.9775 60.9322 25.2957 61.4663 25.0002L65.5913 22.6139C66.1141 22.307 66.7958 22.4889 67.0913 23.023C67.3981 23.5457 67.2163 24.2275 66.6822 24.523L62.5572 26.9093C62.3868 27.0002 62.1936 27.0456 62.0118 27.0456Z"
      fill="black"
    />
    <path
      d="M70.2953 39.9447H65.5339C64.9203 39.9447 64.4316 39.4561 64.4316 38.8425C64.4316 38.2289 64.9203 37.7402 65.5339 37.7402H70.2953C70.9089 37.7402 71.3975 38.2289 71.3975 38.8425C71.3975 39.4561 70.9089 39.9447 70.2953 39.9447Z"
      fill="black"
    />
    <path
      d="M66.2621 55.2624C66.0803 55.2624 65.8871 55.2169 65.7166 55.1147L61.5916 52.7283C61.0689 52.4215 60.8871 51.751 61.1825 51.2283C61.4894 50.7056 62.1598 50.5238 62.6825 50.8192L66.8075 53.2056C67.3303 53.5124 67.5121 54.1829 67.2166 54.7056C67.0121 55.0579 66.6485 55.2624 66.2621 55.2624Z"
      fill="black"
    />
  </svg>
);

const MappingOpportunitiesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="80" height="99" viewBox="0 0 80 99" fill="none">
    <path
      d="M8.0563 80.0009H71.9428C74.386 80.0009 76.3633 78.0236 76.3633 75.5804V11.6939C76.3633 9.25067 74.386 7.27344 71.9428 7.27344H8.04539C5.61353 7.27344 3.6363 9.25075 3.6363 11.6939V75.5913C3.6363 78.0232 5.61317 80.0009 8.0563 80.0009ZM71.9428 9.47795C73.1588 9.47795 74.1588 10.4666 74.1588 11.6939V75.5913C74.1588 76.8073 73.1701 77.8073 71.9428 77.8073H8.04539C6.82947 77.8073 5.82946 76.8186 5.82946 75.5913V11.6939C5.82946 10.4779 6.81812 9.47795 8.04539 9.47795H71.9428Z"
      fill="black"
    />
    <path
      d="M47.1589 41.1717H66.7269C68.2497 41.1717 69.4883 39.933 69.4883 38.4103V18.8532C69.4883 17.3304 68.2497 16.0918 66.7269 16.0918H47.1589C45.6361 16.0918 44.3975 17.3304 44.3975 18.8532V38.4103C44.3975 39.933 45.6361 41.1717 47.1589 41.1717ZM66.7269 18.2967C67.0224 18.2967 67.2724 18.5467 67.2724 18.8536V38.4106C67.2724 38.7175 67.0224 38.9675 66.7155 38.9675H47.1584C46.8516 38.9675 46.6016 38.7175 46.6016 38.4106V18.8536C46.6016 18.5467 46.8516 18.2967 47.1584 18.2967H66.7269Z"
      fill="black"
    />
    <path
      d="M13.2722 41.1717H32.8402C34.3629 41.1717 35.6016 39.933 35.6016 38.4103V18.8532C35.6016 17.3304 34.3629 16.0918 32.8402 16.0918H13.2722C11.7494 16.0918 10.5108 17.3304 10.5108 18.8532V38.4103C10.5222 39.933 11.7608 41.1717 13.2722 41.1717ZM32.8402 18.2967C33.147 18.2967 33.397 18.5467 33.397 18.8536V38.4106C33.397 38.7175 33.147 38.9675 32.8402 38.9675H13.2722C12.9654 38.9675 12.7154 38.7175 12.7154 38.4106V18.8536C12.7154 18.5467 12.9654 18.2967 13.2722 18.2967H32.8402Z"
      fill="black"
    />
    <path
      d="M47.1589 71.1834H66.7269C68.2497 71.1834 69.4883 69.9448 69.4883 68.422V48.8649C69.4883 47.3421 68.2497 46.1035 66.7269 46.1035H47.1589C45.6361 46.1035 44.3975 47.3421 44.3975 48.8649V68.4329C44.3975 69.9442 45.6361 71.1834 47.1589 71.1834ZM66.7269 48.3085C67.0224 48.3085 67.2724 48.5585 67.2724 48.8653V68.4333C67.2724 68.7401 67.0224 68.9901 66.7155 68.9901H47.1584C46.8516 68.9901 46.6016 68.7401 46.6016 68.4333V48.8653C46.6016 48.5585 46.8516 48.3085 47.1584 48.3085H66.7269Z"
      fill="black"
    />
    <path
      d="M13.2722 71.1834H32.8402C34.3629 71.1834 35.6016 69.9448 35.6016 68.422V48.8649C35.6016 47.3421 34.3629 46.1035 32.8402 46.1035H13.2722C11.7494 46.1035 10.5108 47.3421 10.5108 48.8649V68.4329C10.5222 69.9442 11.7608 71.1834 13.2722 71.1834ZM32.8402 48.3085C33.147 48.3085 33.397 48.5585 33.397 48.8653V68.4333C33.397 68.7401 33.147 68.9901 32.8402 68.9901H13.2722C12.9654 68.9901 12.7154 68.7401 12.7154 68.4333V48.8653C12.7154 48.5585 12.9654 48.3085 13.2722 48.3085H32.8402Z"
      fill="black"
    />
    <path
      d="M23.0561 29.7631H56.9427C57.5563 29.7631 58.0449 29.2745 58.0449 28.6608C58.0449 28.0472 57.5563 27.5586 56.9427 27.5586H23.0561C22.4425 27.5586 21.9539 28.0472 21.9539 28.6608C21.9539 29.2631 22.4539 29.7631 23.0561 29.7631Z"
      fill="black"
    />
    <path
      d="M52.0336 33.4323C52.2608 33.4323 52.4995 33.3641 52.6926 33.2164L57.6017 29.5459C57.8745 29.3413 58.0449 29.0118 58.0449 28.6595C58.0449 28.3072 57.8858 27.989 57.6017 27.7731L52.6926 24.1026C52.204 23.739 51.5108 23.8412 51.1472 24.3299C50.7836 24.8185 50.8858 25.5117 51.3745 25.8753L55.1017 28.6594L51.3745 31.4435C50.8858 31.8071 50.7836 32.5003 51.1472 32.9889C51.3631 33.273 51.6926 33.4323 52.0336 33.4323Z"
      fill="black"
    />
    <path
      d="M56.5799 60.2731C56.8754 60.2731 57.1822 60.1481 57.3981 59.9095C57.8072 59.455 57.7731 58.7618 57.3186 58.3527L32.2393 35.5687C31.7847 35.1596 31.0916 35.1937 30.6825 35.6482C30.2734 36.1028 30.3075 36.796 30.762 37.205L55.8304 59.989C56.0463 60.1822 56.3072 60.2731 56.5799 60.2731Z"
      fill="black"
    />
    <path
      d="M56.5801 60.2732C56.8869 60.2732 57.1823 60.1482 57.3982 59.9095C57.6369 59.6482 57.7278 59.2959 57.6596 58.955L56.4891 52.9436C56.3755 52.3414 55.796 51.955 55.1937 52.0686C54.5915 52.1823 54.2051 52.7618 54.3187 53.3641L55.2051 57.9322L50.5688 57.489C49.9551 57.4322 49.4211 57.8754 49.3643 58.4777C49.3075 59.08 49.7506 59.6254 50.3529 59.6822L56.4552 60.2731L56.5801 60.2732Z"
      fill="black"
    />
  </svg>
);

const JobOpportunitiesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="80" height="99" viewBox="0 0 80 99" fill="none">
    <path
      d="M39.0577 64.5336C38.7622 64.5336 38.4781 64.5336 38.1941 64.5222C26.4668 64.2154 14.933 57.6245 3.9097 44.9542C3.5347 44.5224 3.54606 43.8747 3.94379 43.4656C16.7845 30.1812 29.5234 23.6248 41.8071 23.9427C53.5343 24.2495 65.0681 30.8404 76.0914 43.5107C76.4664 43.9425 76.4551 44.5902 76.0573 44.9993C63.5235 57.9651 51.0802 64.5336 39.0577 64.5336ZM6.23951 44.2725C16.6373 55.9656 27.3988 62.034 38.2395 62.3176C49.6715 62.613 61.6148 56.5221 73.7508 44.1925C63.3646 32.4994 52.6031 26.431 41.7508 26.1358C30.3188 25.8403 18.3871 31.9426 6.23951 44.2725Z"
      fill="black"
    />
    <path
      d="M40.0015 59.8761C31.3768 59.8761 24.3535 52.8534 24.3535 44.2281C24.3535 35.6028 31.3762 28.5801 40.0015 28.5801C48.6268 28.5801 55.6495 35.6028 55.6495 44.2281C55.6495 52.8534 48.6268 59.8761 40.0015 59.8761ZM40.0015 30.7852C32.5921 30.7852 26.5586 36.8193 26.5586 44.2281C26.5586 51.6369 32.5927 57.671 40.0015 57.671C47.4103 57.671 53.4444 51.6369 53.4444 44.2281C53.4444 36.8193 47.4103 30.7852 40.0015 30.7852Z"
      fill="black"
    />
    <path
      d="M40.0003 50.4675C36.5571 50.4675 33.7617 47.672 33.7617 44.2289C33.7617 40.7857 36.5572 37.9902 40.0003 37.9902C43.4435 37.9902 46.239 40.7857 46.239 44.2289C46.239 47.672 43.4435 50.4675 40.0003 50.4675ZM40.0003 40.1947C37.7731 40.1947 35.9662 42.0016 35.9662 44.2289C35.9662 46.4561 37.7731 48.263 40.0003 48.263C42.2276 48.263 44.0344 46.4561 44.0344 44.2289C44.0344 42.0016 42.2276 40.1947 40.0003 40.1947Z"
      fill="black"
    />
    <path
      d="M40.0007 19.2958C39.3871 19.2958 38.8984 18.8071 38.8984 18.1935V9.73897C38.8984 9.12534 39.3871 8.63672 40.0007 8.63672C40.6143 8.63672 41.1029 9.12536 41.1029 9.73897V18.1935C41.1029 18.8072 40.6143 19.2958 40.0007 19.2958Z"
      fill="black"
    />
    <path
      d="M22.9107 20.6019C22.4789 20.6019 22.0812 20.3519 21.8994 19.9314L18.5471 12.17C18.3085 11.6132 18.5585 10.9655 19.1266 10.7268C19.6835 10.4881 20.3312 10.7381 20.5698 11.3063L23.9221 19.0678C24.1608 19.6246 23.9108 20.2723 23.3426 20.511C23.2062 20.5792 23.0471 20.6019 22.9107 20.6019Z"
      fill="black"
    />
    <path
      d="M57.092 20.6022C56.9443 20.6022 56.7965 20.5681 56.6602 20.5113C56.1033 20.2727 55.842 19.6249 56.0806 19.0681L59.4329 11.3066C59.6715 10.7498 60.3193 10.4885 60.8761 10.7271C61.4329 10.9657 61.6943 11.6135 61.4557 12.1703L58.1034 19.9318C57.9329 20.3522 57.5238 20.6022 57.092 20.6022Z"
      fill="black"
    />
    <path
      d="M40.0007 78.6376C39.3871 78.6376 38.8984 78.1489 38.8984 77.5353V69.0808C38.8984 68.4671 39.3871 67.9785 40.0007 67.9785C40.6143 67.9785 41.1029 68.4672 41.1029 69.0808V77.5353C41.1029 78.1489 40.6143 78.6376 40.0007 78.6376Z"
      fill="black"
    />
    <path
      d="M60.4557 76.637C60.0238 76.637 59.6261 76.387 59.4443 75.9666L56.092 68.2051C55.8534 67.6483 56.1034 67.0006 56.6716 66.7619C57.2284 66.5233 57.8761 66.7733 58.1148 67.3415L61.4671 75.1029C61.7057 75.6598 61.4557 76.3074 60.8875 76.5461C60.7511 76.603 60.592 76.637 60.4557 76.637Z"
      fill="black"
    />
    <path
      d="M19.5471 76.6374C19.3993 76.6374 19.2516 76.6033 19.1152 76.5465C18.5584 76.3078 18.2971 75.6601 18.5357 75.1033L21.888 67.3418C22.1266 66.785 22.7744 66.5236 23.3312 66.7623C23.888 67.0009 24.1494 67.6487 23.9107 68.2055L20.5584 75.9669C20.388 76.3874 19.9789 76.6374 19.5471 76.6374Z"
      fill="black"
    />
  </svg>
);

const TrainingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="80" height="99" viewBox="0 0 80 99" fill="none">
    <path
      d="M37.2165 80.0005H15.9437C15.3983 80.0005 14.8755 79.9324 14.4096 79.8074C11.4892 79.1142 9.45508 76.5233 9.45508 73.512V46.5687C9.45508 45.955 9.95508 45.4551 10.5687 45.4551C11.1823 45.4551 11.6823 45.9551 11.6823 46.5687V73.512C11.6823 75.3074 12.7845 76.8756 14.4209 77.4778C15.3641 76.5914 15.7391 75.4437 15.5914 73.8983C15.5573 73.5801 15.6709 73.2733 15.8755 73.046C16.0914 72.8187 16.3868 72.6824 16.705 72.6824H43.0344C43.3526 72.6824 43.6594 72.8187 43.8753 73.0687C44.0912 73.3187 44.1821 73.6369 44.1367 73.9551C43.864 75.9438 42.989 77.5233 41.5571 78.6369C40.4435 79.5233 38.9324 80.0005 37.2165 80.0005ZM17.0463 77.7619H37.2165C38.0573 77.7619 39.2619 77.6028 40.1938 76.8755C40.8529 76.3642 41.3301 75.7164 41.6256 74.921H17.8642C17.8074 75.9778 17.5349 76.9324 17.0463 77.7619Z"
      fill="black"
    />
    <path
      d="M38.6929 74.9091C38.0792 74.9091 37.5793 74.4091 37.5793 73.7955V45.5344C37.5793 42.8867 35.4316 40.7389 32.7838 40.7389H7.40852C6.79489 40.7389 6.29492 40.2389 6.29492 39.6253C6.29492 39.0117 6.79492 38.5117 7.40852 38.5117H32.7947C36.6697 38.5117 39.8288 41.6594 39.8288 45.5344V73.7955C39.8174 74.4091 39.3179 74.9091 38.6929 74.9091Z"
      fill="black"
    />
    <path
      d="M10.5795 47.8071H4.2386C3.62496 47.8071 3.125 47.3071 3.125 46.6935V42.7958C3.125 40.4322 5.04544 38.5117 7.40907 38.5117C9.77271 38.5117 11.6931 40.4322 11.6931 42.7958V46.6935C11.6931 47.3072 11.1931 47.8071 10.5795 47.8071ZM5.35227 45.5685H9.45453V42.7844C9.45453 41.6481 8.53409 40.7276 7.39773 40.7276C6.26136 40.7276 5.34093 41.6481 5.34093 42.7844V45.5685H5.35227Z"
      fill="black"
    />
    <path
      d="M31.5235 56.4667H15.762C15.1484 56.4667 14.6484 55.9667 14.6484 55.3531V46.0804C14.6484 45.4668 15.1484 44.9668 15.762 44.9668H31.5119C32.1255 44.9668 32.6255 45.4668 32.6255 46.0804V55.3531C32.6368 55.9668 32.1371 56.4667 31.5235 56.4667ZM16.8871 54.2394H30.41V47.2053H16.8871V54.2394Z"
      fill="black"
    />
    <path
      d="M31.5235 62.2272H15.762C15.1484 62.2272 14.6484 61.7272 14.6484 61.1136C14.6484 60.5 15.1484 60 15.762 60H31.5119C32.1255 60 32.6255 60.5 32.6255 61.1136C32.6368 61.7272 32.1371 62.2272 31.5235 62.2272Z"
      fill="black"
    />
    <path
      d="M31.5235 67.317H15.762C15.1484 67.317 14.6484 66.817 14.6484 66.2034C14.6484 65.5898 15.1484 65.0898 15.762 65.0898H31.5119C32.1255 65.0898 32.6255 65.5898 32.6255 66.2034C32.6368 66.8171 32.1371 67.317 31.5235 67.317Z"
      fill="black"
    />
    <path
      d="M70.0216 54.1595C69.9648 54.1595 69.9079 54.1595 69.8398 54.1481C69.2261 54.0572 68.8171 53.4776 68.908 52.864L72.1807 32.296C72.9876 27.1256 72.4307 22.0917 70.567 17.7164L70.1579 16.8073C67.5557 11.0914 61.0219 8.19349 54.9761 10.08L52.7602 10.7732C52.5897 10.83 52.3966 10.8414 52.2261 10.8073L48.2148 10.0687C44.442 9.37551 40.59 10.3982 37.6468 12.8528C34.7035 15.3073 33.0104 18.921 33.0104 22.7502V39.6251C33.0104 40.2388 32.5104 40.7387 31.8968 40.7387C31.2832 40.7387 30.7832 40.2387 30.7832 39.6251V22.7502C30.7832 18.2502 32.7605 14.0229 36.2264 11.1364C39.6809 8.24999 44.2039 7.06817 48.6242 7.87501L52.3628 8.56819L54.3174 7.95455C61.4424 5.73863 69.1356 9.14772 72.2039 15.8978L72.613 16.8183C74.6585 21.6023 75.2721 27.0684 74.3971 32.6481L71.1244 53.2277C71.0335 53.7732 70.5557 54.1595 70.0216 54.1595Z"
      fill="black"
    />
    <path
      d="M75.7622 79.625H39.512C38.8984 79.625 38.3984 79.125 38.3984 78.5114C38.3984 77.8978 38.8984 77.3978 39.512 77.3978H74.6371V61.2727C74.6371 57.0455 71.2053 53.6022 66.9891 53.6022H59.2051C58.5915 53.6022 58.0915 53.1022 58.0915 52.4886C58.0915 51.875 58.5915 51.375 59.2051 51.375H67.0008C72.4553 51.375 76.8873 55.8182 76.8873 61.2725V78.5001C76.8873 79.1251 76.3872 79.625 75.7622 79.625Z"
      fill="black"
    />
    <path
      d="M43.6808 53.6022H38.7034C38.0898 53.6022 37.5898 53.1022 37.5898 52.4886C37.5898 51.875 38.0898 51.375 38.7034 51.375H43.6808C44.2944 51.375 44.7944 51.875 44.7944 52.4886C44.7944 53.1022 44.2944 53.6022 43.6808 53.6022Z"
      fill="black"
    />
    <path
      d="M55.7489 47.2038H47.2827C47.0327 47.2038 46.7941 47.1243 46.6009 46.9652C40.1464 41.9311 36.6351 34.8517 36.1805 25.931C36.1692 25.6356 36.2715 25.3401 36.476 25.1242C36.6805 24.9083 36.9646 24.7719 37.2601 24.7605C43.3055 24.556 46.9532 22.5105 48.7262 18.3287C48.8967 17.931 49.2831 17.6582 49.7262 17.6469C50.1581 17.6355 50.5671 17.8741 50.7604 18.2719C53.4081 23.5901 57.6921 26.7148 63.8062 27.7606C63.8062 27.7265 63.8175 27.6924 63.8175 27.6583C63.8744 27.0447 64.4198 26.6015 65.0335 26.6583C65.6471 26.7151 66.1017 27.2606 66.0335 27.8743C66.0335 27.9311 66.0221 27.9879 66.0221 28.0447C66.4085 28.0788 66.8062 28.1015 67.2153 28.1243C67.8289 28.147 68.3062 28.6811 68.2835 29.2947C68.2608 29.9084 67.738 30.4083 67.113 30.363C66.6471 30.3402 66.1812 30.3061 65.7267 30.2721C64.5903 36.9652 61.4881 42.5673 56.499 46.9542C56.2831 47.102 56.0216 47.2038 55.7489 47.2038ZM47.6696 44.9652H55.3176C59.7722 40.9425 62.4653 36.011 63.4878 29.9536C57.3969 28.9195 52.7947 25.9536 49.7722 21.1012C47.5449 24.6012 43.829 26.5103 38.4769 26.9194C39.1133 34.6009 42.1246 40.5216 47.6704 44.9645L47.6696 44.9652Z"
      fill="black"
    />
    <path
      d="M51.443 56.9203C48.6135 56.9203 45.7725 55.7271 42.9659 53.3407C42.5568 52.9884 42.4546 52.4089 42.7159 51.943L46.3182 45.5339C46.625 44.9998 47.3068 44.8066 47.8409 45.1134C48.375 45.4203 48.5682 46.1021 48.2727 46.6362L45.1364 52.2158C49.3864 55.4658 53.5451 55.4658 57.7953 52.2044L54.7839 46.6135C54.4885 46.068 54.693 45.3976 55.2385 45.1021C55.7839 44.8067 56.4544 45.0112 56.7498 45.5567L60.193 51.9658C60.443 52.4317 60.3294 53.0112 59.9317 53.3521C57.1021 55.7271 54.2727 56.9203 51.443 56.9203Z"
      fill="black"
    />
  </svg>
);

const CompetenceIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="80" height="99" viewBox="0 0 80 99" fill="none">
    <path
      d="M75.6363 80.0006H4.3636C3.74996 80.0006 3.25 79.5006 3.25 78.887C3.25 78.2734 3.75 77.7734 4.3636 77.7734H75.648C76.2616 77.7734 76.7616 78.2734 76.7616 78.887C76.7502 79.5007 76.2613 80.0006 75.6363 80.0006Z"
      fill="black"
    />
    <path
      d="M35.9216 79.9994C35.3421 79.9994 34.8534 79.5448 34.808 78.9539L31.9785 35.8288C31.9444 35.2379 32.3649 34.7266 32.9444 34.647L57.8986 31.4311C58.5008 31.3629 59.069 31.7833 59.1486 32.397C59.2282 33.0106 58.7963 33.5674 58.1827 33.647L34.262 36.7266L37.0234 78.8058C37.0688 79.4195 36.6029 79.9535 35.9893 79.9877C35.9665 79.999 35.9443 79.9994 35.9216 79.9994Z"
      fill="black"
    />
    <path
      d="M19.3753 80.0004C18.7616 80.0004 18.2617 79.5004 18.2617 78.8868V53.5573H16.5003C15.1253 53.5573 13.8071 52.9892 12.8639 51.9892C11.9207 50.9892 11.4435 49.671 11.5344 48.2846L12.1821 36.5915C12.5571 30.0802 17.9662 24.9668 24.5007 24.9668H58.0461C58.6598 24.9668 59.1597 25.4668 59.1597 26.0804C59.1597 26.694 58.6597 27.194 58.0461 27.194H24.5007C19.1484 27.194 14.7167 31.3758 14.4098 36.7169L13.762 48.4216C13.7166 49.1944 13.9779 49.9103 14.4893 50.4671C15.012 51.0239 15.7279 51.3307 16.5007 51.3307H19.3756C19.9893 51.3307 20.4892 51.8307 20.4892 52.4443V78.8872C20.4892 79.5009 19.9889 80.0004 19.3753 80.0004Z"
      fill="black"
    />
    <path
      d="M26.6488 80.0002C26.0351 80.0002 25.5352 79.5002 25.5352 78.8866V53.2386C25.5352 52.625 26.0352 52.125 26.6488 52.125C27.2624 52.125 27.7624 52.625 27.7624 53.2386V78.8866C27.7624 79.5002 27.2624 80.0002 26.6488 80.0002Z"
      fill="black"
    />
    <path
      d="M26.8872 23.9774C22.2849 23.9774 18.5352 20.2275 18.5352 15.6254C18.5352 11.0234 22.2738 7.27344 26.8872 7.27344C31.5005 7.27344 35.2392 11.0234 35.2392 15.6254C35.2392 20.2275 31.4892 23.9774 26.8872 23.9774ZM26.8872 9.50035C23.5122 9.50035 20.7621 12.2503 20.7621 15.6254C20.7621 19.0004 23.5121 21.7504 26.8872 21.7504C30.2622 21.7504 33.0122 19.0004 33.0122 15.6254C33.0122 12.2503 30.2622 9.50035 26.8872 9.50035Z"
      fill="black"
    />
    <path
      d="M62.7043 80.0007C62.3066 80.0007 61.9316 79.7848 61.7384 79.4325L57.0794 71.1714C56.9885 71.001 56.9316 70.8192 56.9316 70.626V17.5467C56.9316 16.2058 58.0226 15.1035 59.3748 15.1035H66.0453C67.3863 15.1035 68.4885 16.1944 68.4885 17.5467V70.626C68.4885 70.8192 68.4431 71.0124 68.3408 71.1714L63.6817 79.4325C63.4772 79.7848 63.1021 80.0007 62.7043 80.0007ZM59.1589 70.3302L62.7043 76.6142L66.2498 70.3302V17.5462C66.2498 17.4325 66.1589 17.3303 66.0339 17.3303H59.3634C59.2497 17.3303 59.1475 17.4212 59.1475 17.5462V70.3302H59.1589Z"
      fill="black"
    />
    <path
      d="M67.3631 71.7389H58.0452C57.4316 71.7389 56.9316 71.2389 56.9316 70.6253C56.9316 70.0117 57.4316 69.5117 58.0452 69.5117H67.3631C67.9767 69.5117 68.4767 70.0117 68.4767 70.6253C68.4767 71.2389 67.9767 71.7389 67.3631 71.7389Z"
      fill="black"
    />
    <path
      d="M64.4994 76.8073H60.9085C60.2949 76.8073 59.7949 76.3073 59.7949 75.6937C59.7949 75.0801 60.2949 74.5801 60.9085 74.5801H64.4994C65.1131 74.5801 65.613 75.0801 65.613 75.6937C65.613 76.3073 65.113 76.8073 64.4994 76.8073Z"
      fill="black"
    />
    <path
      d="M67.3631 23.4655H58.0452C57.4316 23.4655 56.9316 22.9655 56.9316 22.3519C56.9316 21.7383 57.4316 21.2383 58.0452 21.2383H67.3631C67.9767 21.2383 68.4767 21.7383 68.4767 22.3519C68.4767 22.9655 67.9767 23.4655 67.3631 23.4655Z"
      fill="black"
    />
    <path
      d="M65.3978 17.3304C64.7842 17.3304 64.2843 16.8304 64.2843 16.2168V15.3077C64.2843 14.4213 63.557 13.694 62.6592 13.694C61.7728 13.694 61.0456 14.4213 61.0456 15.3077V16.2168C61.0456 16.8304 60.5456 17.3304 59.932 17.3304C59.3184 17.3304 58.8184 16.8304 58.8184 16.2168V15.3077C58.8184 13.1941 60.5343 11.4668 62.6592 11.4668C64.7842 11.4668 66.5115 13.1941 66.5115 15.3077V16.2168C66.5115 16.8304 66.0114 17.3304 65.3978 17.3304Z"
      fill="black"
    />
  </svg>
);

const ToolTipContent = () => {
  const { t } = useTranslation();

  return (
    <>
      <div className="text-heading-4 mb-4">{t('tool.my-own-data.goals.selection-info-card-title')}</div>
      <p>{t('tool.my-own-data.goals.selection-info-card-description')}</p>
    </>
  );
};

const Goals = () => {
  const { t } = useTranslation();
  const toolStore = useToolStore();

  return (
    <>
      <h2 className="text-heading-2-mobile sm:text-heading-2 mb-3 sm:mb-5">{t('tool.my-own-data.goals.title')}</h2>
      <p className="text-body-md-mobile sm:text-body-md whitespace-pre-wrap mb-6">
        {t('tool.my-own-data.goals.description')}
      </p>
      <div className="flex flex-wrap flex-col space-between gap-3">
        <SelectionCard
          selected={toolStore.tavoitteet.a}
          onClick={() => toolStore.setTavoitteet({ ...toolStore.tavoitteet, a: !toolStore.tavoitteet.a })}
          label={t('tool.my-own-data.goals.map-competence')}
          infoAriaLabel="info"
          icon={<CompetenceIcon />}
          tooltipContent={<ToolTipContent />}
          sm={false}
        />
        <SelectionCard
          selected={toolStore.tavoitteet.b}
          onClick={() => toolStore.setTavoitteet({ ...toolStore.tavoitteet, b: !toolStore.tavoitteet.b })}
          label={t('tool.my-own-data.goals.trainings')}
          infoAriaLabel="info"
          icon={<TrainingsIcon />}
          tooltipContent={<ToolTipContent />}
          sm={false}
        />
        <SelectionCard
          selected={toolStore.tavoitteet.c}
          onClick={() => toolStore.setTavoitteet({ ...toolStore.tavoitteet, c: !toolStore.tavoitteet.c })}
          label={t('tool.my-own-data.goals.job-opportunities')}
          infoAriaLabel="info"
          icon={<JobOpportunitiesIcon />}
          tooltipContent={<ToolTipContent />}
          sm={false}
        />
        <SelectionCard
          selected={toolStore.tavoitteet.d}
          onClick={() => toolStore.setTavoitteet({ ...toolStore.tavoitteet, d: !toolStore.tavoitteet.d })}
          label={t('tool.my-own-data.goals.map-opportunities')}
          infoAriaLabel="info"
          icon={<MappingOpportunitiesIcon />}
          tooltipContent={<ToolTipContent />}
          sm={false}
        />
        <SelectionCard
          selected={toolStore.tavoitteet.e}
          onClick={() => toolStore.setTavoitteet({ ...toolStore.tavoitteet, e: !toolStore.tavoitteet.e })}
          label={t('tool.my-own-data.goals.something-else')}
          infoAriaLabel="info"
          icon={<SomethingElseIcon />}
          tooltipContent={<ToolTipContent />}
          sm={false}
        />
      </div>
    </>
  );
};

export default Goals;
