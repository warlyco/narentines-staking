import { useEffect, useState } from "react";

// const useCounter = (initialDate: string) => {
//   const startingTime = new Date(initialDate).getTime();

//   const [count, setCount] = useState(
//     startingTime + new Date().getTime()
//   );

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCount(startingTime + new Date().getTime());
//     }, 1000);

//     return () => clearInterval(interval);
//   }, [startingTime]);

//   return [count];
// };

// const getReturnValues = (count: number) => {
//   // calculate time left
//   const days =

//   return [days, hours, minutes, seconds];
// };

// export { useCounter };
