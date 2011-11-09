# Build script to update the branch gh-pages, which
# contains the live copy of the demo.
TMP=/tmp/gh-pages
SRC=target/sencha-touch-angular-adapter
if $M2_HOME/bin/mvn package; then
    mkdir -p $TMP
    rm -fr $TMP
    cp -r $SRC/ $TMP
    git stash
    if git checkout gh-pages; then
      rm -fr *
      cp -r $TMP/ .
      git add .
      git commit -a -m "updated pages"
      git checkout master
    fi
    git stash pop
fi

