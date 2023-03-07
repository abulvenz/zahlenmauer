const range = (N, arr = []) =>
  N === 0 ? arr : range(N - 1, [...arr, arr.length]);

console.log(range(20));

const range2 = ((buffer = []) => {
  const reserve = (N) => {
    if (N > buffer.length) {
      for (let i = buffer.length; i < N; i++) buffer.push(i);
    }
    return true;
  };
  return (N) => reserve(N) && buffer.slice(0, N);
})();

console.log(range2(2));
console.log(range2(39));
