export const transactions = [
  ["Penjualan nasi goreng seafood", "4 Porsi", "+Rp 100.000", "income"],
  ["Penjualan nasi goreng hongkong", "3 Porsi", "+Rp 60.000", "income"],
  ["Kantong plastik", "", "-Rp 12.000", "expense"],
  ["Kertas nasi", "", "-Rp 20.000", "expense"]
] as const;

export const products = [
  ["Nasi goreng seafood", "Rp 18.000", "Rp25.000", "MARGIN 39%", "/assets/seafood.png"],
  ["Nasi goreng mawut", "Rp 11.500", "Rp15.000", "MARGIN 30%", "/assets/mawut.png"],
  ["Nasi goreng jawa", "Rp 8.000", "Rp12.000", "MARGIN 49%", "/assets/jawa.png"],
  ["Nasi goreng hongkong", "Rp 15.000", "Rp20.000", "MARGIN 33%", "/assets/hongkong.png"]
] as const;
