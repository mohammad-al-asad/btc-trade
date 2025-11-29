export const getModifiedBtc = (adjustment: string, payload: string) => {
  const adjustmentFloat = parseFloat(adjustment);
  if (adjustmentFloat != 0 && !adjustmentFloat) {
    return null;
  } else if(adjustmentFloat<0){
    return parseFloat(payload) - Math.abs(adjustmentFloat)
  }else{
    return parseFloat(payload) + adjustmentFloat
  }
};