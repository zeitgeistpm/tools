yarn cli:lint
if [ $? -eq 1 ]
then
  echo "Need to fix cli!"
  exit 1
fi

yarn sdk:lint
if [ $? -eq 1 ]
then
  echo "Need to fix sdk!"
  exit 1
fi

yarn type-defs:lint
if [ $? -eq 1 ]
then
  echo "Need to fix type-defs!"
  exit 1
fi
