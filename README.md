# gulp tasks for Joomla 3 Theme Development
This gulp file is for [Joomla](https://joomla.org) 3 Theme development. It contains simple tasks for template customizing starting with the core Protostar template in Joomla 3 or for building your own themes using the core jui bootstrap less files. This gulpfile was put together using the [Joomla Tools Vagrant Box](http://developer.joomlatools.com/tools/vagrant.html) and [Virtual Box](https://www.virtualbox.org/) as the development environment. You will find that I reference this enviroment in the readme however this environment is not required. The gulpfile can be tweaked to work in any dev enviroment.

## Requirements
Requires [Node](https://nodejs.org/en/), [NPM](https://www.npmjs.com/), [Gulp](http://gulpjs.com/) and a [Joomla 3.4.x](http://joomlacode.org/gf/project/joomla/frs/) installation to be installed on your dev environment. 
### Recommended
Recommended development environment to make things easy, vagrant box [joomlatools/box](https://github.com/joomlatools/joomla-vagrant). [Joomla Tools Documentation here](http://developer.joomlatools.com/tools/vagrant/getting-started.html) on how to get setup, run commands, etc. [Vagrant Documentation](https://www.vagrantup.com/). 

Assuming you have the Joomla Tools Box setup and running then this directly applies. At the time of this writing the Joomla Tools Vagrant Box has Node 0.10.37 and NPM 1.4.28 which is lower then the wanted version. Lets update node on this box. SSH into the vagrant box and run:
```sh
$ curl -sL https://deb.nodesource.com/setup_0.12 | sudo -E bash -
$ sudo apt-get install -y nodejs
```
This upgrade of NODE will only persist with the VM. However it could be added to the box by adding it in as part of the provisioning.
For example adding it as an inline shell script in the Vagrantfile. 

```rb
  # Enable provisioning with a shell script. Additional provisioners such as
  # Puppet, Chef, Ansible, Salt, and Docker are also available. Please see the
  # documentation for more information about their specific syntax and use.
  config.vm.provision "shell", inline: <<-SHELL
  #   sudo apt-get update
  #   sudo apt-get install -y apache2

  # ADDED SHELL PROVISION
  curl -sL https://deb.nodesource.com/setup_0.12 | sudo -E bash -
  sudo apt-get install -y nodejs
  SHELL
```

Then running: 
```sh
$ vagrant provision --provision-with shell
```

Now Node v0.12.7 or > and NPM v2.11.3 or > are installed.  

SSH into the vagrant box.
```sh
$ vagrant ssh
```

Now lets install gulp:
### Install gulp globally:
```sh
$ npm install --global gulp
```
*Note: You may need to run the command with sudo. For some alternate methods on using npm without sudo, see John Papa's post on [How to use npm global without sudo on OSX](http://www.johnpapa.net/how-to-use-npm-global-without-sudo-on-osx/) or do some searching on the subject.*  
## Getting Started
Create a Joomla site, via joomla console command from the terminal.
```sh
$ joomla site:create mysite
``` 
*Or we need to have a base Joomla CMS installed to move foward.*

 Change to the directory of your template or the protostar template. Then run:
```sh
$ git clone https://github.com/cmocha/joomla3-template-gulp-tasks.git
```

*Now the repo should be cloned into your Joomla 3 template directory or default Protostar template directory.*
- Lets move the files into the template directory and out of the cloned repo directory. 
```sh
$ cd gulp-tasks-joomla3-templating/
$ mv gulpfile.js package.json ../
$ cd ..
```

### Setup build.less file
Create a new file in your templates less directory. Name this file build.less

```sh
$ cd less/
```
Now create the file. Using your text editor. I will use nano.
```sh
$ nano build.less
```
Paste this into the build.less file.
```less
// Use this import only for using Protostar theme as a base.
@import "template.less";

// Or if you want to compile only the Core JUI Joomla Bootstrap v2 Less files
// without the Protostar template or variables then uncomment import below
// and be sure to comment the import above for Protostar.
// @import "../../../media/jui/less/bootstrap.less";

// Dont change this #grid mixin. Or compiling less to css breaks.
// This is a custom mixin to make Less compile Bootstrap v2 files
// This appears to be a fix for when compiling with Less version 2 or greater.
// Taken from stackoverflow post below.
// http://stackoverflow.com/questions/26628309/less-v2-does-not-compile-twitters-bootstrap-2-x

#grid {
    .core  {
        .span(@gridColumns) {
            width: (@gridColumnWidth * @gridColumns) + (@gridGutterWidth * (@gridColumns - 1));
        }
    }
};
```
Save this build.less file. This file will serve as our main entry point for all of the bootstrap less files in the Joomla core media/jui/less directory. 
We can leave this file as is to import the template.less if we intend to customize the Protostar template. 
```less
@import "template.less";
```
 Or we can instead comment out the line:
```less
// @import "template.less";
```
and uncomment the line:
```less
@import "../../../media/jui/less/bootstrap.less";
```
if we would rather build bootstrap.less for a custom template.

### Install dependancies for gulp file.
We now have the template setup to work with the gulp tasks. We should see the package.json and gulpfile.js in our template directory from the repo. Then run:
```sh
$ npm install
```
This will install the required gulp plugins for our gulp task. Grab a coffee. It may take a couple minutes.

### Configure BrowserSync
Next you need to customize the browserSync proxy line in the gulpfile.js to your sites path. This example is based on using the vagrant box joomlatools/box.

For example, if you type joomla.box/mysite in your browser to view your development Joomla site then you will need to update the proxy line accordingly. See gulpfile.js for more details. I used the ip address that is setup using the Joomla Tools Vagrant Box.

Example:
```js
proxy: "33.33.33.58:80"
```
Before you will be able to use browserSync if you are using Vagrant and the Joomla Tools Box, you will need to update your Vagrantfile so that it forwards the ports from the guest to the host.
Add these lines in your Vagrantfile inside the Vagrant.configure block:
```rb
  config.vm.network "forwarded_port", guest: 3000, host: 3000
  config.vm.network "forwarded_port", guest: 3001, host: 3001

  #Enable public network 
    config.vm.network "public_network"
  # 
  #run ifconfig inside vagrant box to see the appropriate address available to connect via the network from external device.
```
Then run
```sh
$ vagrant reload
```
Now you should be ready to begin using the gulp tasks and browserSync with Vagrant and the Joomla Tools Box.
## Gulp Tasks


Running gulp tasks are done from the template directory.
### Development 

```sh
$ gulp
```
This will compile the less files set in build.less into ./css/template.css with sourcemaps to the less files, start browserSync and the watch task.

You should be able to see your site at [http://joomla.box:3000/mysite/](http://joomla.box:3000/mysite/) with browserSync running. 
Also you should be able to see the browserSync interface at [http://joomla.box:3001](http://joomla.box:3001)

Make some changes to the less files, save and you should see browserSync inject your changes into the browser. 


### Production

```sh
$ gulp build
```
This will clean the dist directory and populate it with optimized images from the root image folder and template image folder. 

>Take a moment to look over the other tasks in the file. Customize to your needs.

#### Other Tasks Details


##### clean
The clean task will remove all files in the dist directory except for any images.
```sh
gulp clean
```

##### clean:all
The clean:all task will remove entire dist directory. Part of the build task.
```sh
gulp clean:all
```




##### image
Part of the build task. We use this task to run the images in the root Joomla images directory through image optimizing tools for production and placed into the dist/root/images directory after the build.
```sh
gulp image
```

##### image:tmp
Part of the build task. We use this task to run the images in the Joomla template images directory through image optimizing tools for production and placed into the dist/images directory after the build.
```sh
gulp image:tmp
```

##### fonts
Part of the build task. We use this task to move fonts into the dist/fonts directory.
```sh
gulp fonts
```



## Todos

* Improve tasks.
* Reduce steps for setup. Simplify.
* Perhaps continue to add support for Bootstrap 3 and eventually Bootstrap 4, providing path of Joomla Project.

## Changelog
### Release - 0.0.1

* Simple gulp tasks
* Simple way to customize core template css.
   
   
   
   