let
    pkgs = import <nixpkgs> {};
in
pkgs.mkShell {
    name = "wall-dev";
    buildInputs = with pkgs; [ nodejs yarn ];
}
