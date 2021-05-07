yarn lint:cli
if [ $? -eq 1 ]
then
  exit 1
fi