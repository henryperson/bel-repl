export default [
    {
      title: "hello world",
      code: "(cons 'hello 'world)",
    },
    {
      title: "fibonacci",
      code:
`(def fib (n)
  (if (= n 0)
      '(0)
      (let l '(1 0)
        (repeat (dec n)
          (set l (cons (+ (car l) (cadr l)) l)))
        (rev l))))

(fib 10)`
    },
    {
      title: "quicksort",
      code:
`(set l '(6 3 8 0 2 2 1 6 8 0))

(def quicksort (l)
  (let partition (fn (lo hi)
                   (with (pivot (hi l)
                          i lo)
                     (for j lo hi
                       (if (< (j l) pivot)
                           (do
                             (swap (j l) (i l))
                             (zap inc i))))
                      (swap (i l) (hi l))
                      i))
    ((afn (lo hi)
       (when (< lo hi)
        (let pivot (partition lo hi)
            (self lo (dec pivot))
            (self (inc pivot) hi))))
     1 (len l)))
  l)

(quicksort l)
(prn l)`
    }
]
