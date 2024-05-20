FROM public.ecr.aws/lambda/python:3.12

# Copy requirements.txt file
COPY requirements.txt ./

# Install the python dependencies
RUN pip install -r requirements.txt

# Copy function code
COPY main.py ./ 

# Set the CMD to your handler (could also be done as a parameter override outside of the Dockerfile)
CMD [ "main.handler" ]